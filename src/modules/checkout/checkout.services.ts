import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { createOrderFromCartSchema } from "./checkout.validators";
import { CheckoutLineSnapshot, CheckoutOrder, CreateOrderFromCartInput } from "./checkout.types";
import { BusinessError } from "@/lib/error";

/**
 * Calculates the price based on active discounts.
 */
function getEffectivePrice(product: {
  price: number;
  discountPrice: number | null;
  discountStart: Date | null;
  discountEnd: Date | null;
}, now: Date): number {
  const hasActiveDiscount =
    product.discountPrice != null &&
    (!product.discountStart || now >= product.discountStart) &&
    (!product.discountEnd || now <= product.discountEnd);

  return hasActiveDiscount ? product.discountPrice! : product.price;
}

/**
 * Normalizes street and house number for order display.
 */
function normalizeStreet(street: string, houseNumber: string | null): string {
  return [street, houseNumber].filter(Boolean).join(" ").trim();
}

/**
 * Converts a customer's current cart into an operational order.
 * 
 * Flow:
 * 1. Validate inputs (Zod)
 * 2. Deterministic Idempotency Check (Layer 1)
 * 3. Fetch cart/address and validate stock (Read)
 * 4. Atomic Transaction:
 *    - Create Order & OrderItems
 *    - Decrement Inventory Stock
 *    - Clear Cart
 *    - Create initial Audit Log
 */
export async function createOrderFromCart(input: CreateOrderFromCartInput): Promise<CheckoutOrder> {
  const validated = createOrderFromCartSchema.parse(input);
  const now = new Date();

  // 1. Layer 1: True Idempotency (Deterministic Check)
  if (validated.idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: validated.idempotencyKey },
      include: { items: true }
    });
    if (existingOrder) {
      console.log(`[IDEMPOTENCY]: Replaying existing order ${existingOrder.id} for key ${validated.idempotencyKey}`);
      return existingOrder;
    }
  }

  return prisma.$transaction(async (tx) => {
    // 2. Fetch Cart and Address
    const [cart, address] = await Promise.all([
      tx.cart.findUnique({
        where: { userId: validated.userId },
        include: {
          items: {
            include: { product: true },
            orderBy: { createdAt: "asc" },
          },
        },
      }),
      tx.address.findFirst({
        where: {
          id: validated.addressId,
          userId: validated.userId,
        },
      }),
    ]);

    if (!address) throw new BusinessError("Delivery address not found or unauthorized", 400);
    if (!cart || cart.items.length === 0) throw new BusinessError("Cart is empty", 400);

    // 2. Validate Inventory and Prepare Snapshots
    const lineSnapshots: CheckoutLineSnapshot[] = cart.items.map((item) => {
      const p = item.product;
      if (!p.isActive || p.isDeleted) throw new BusinessError(`Product ${p.name} is no longer available`, 422);
      if (item.quantity > p.quantity) throw new BusinessError(`Insufficient stock for ${p.name}`, 422);

      const unitPrice = getEffectivePrice(p, now);
      return {
        productId: item.productId,
        productName: p.name,
        sku: p.articleNo,
        quantity: item.quantity,
        unitPrice,
        lineTotal: unitPrice * item.quantity,
      };
    });

    const subtotalPrice = lineSnapshots.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalPrice = subtotalPrice;

    // 3. Create the Order
    const order = await tx.order.create({
      data: {
        userId: validated.userId,
        addressId: validated.addressId,
        idempotencyKey: validated.idempotencyKey,
        status: OrderStatus.IN_PROCESS,
        paymentStatus: PaymentStatus.PENDING,
        subtotalPrice,
        adjustmentTotal: 0,
        totalPrice,
        deliveryStreet: normalizeStreet(address.street, address.houseNumber),
        deliveryCity: address.city,
        deliveryPostalCode: address.postalCode,
        deliveryCountry: address.country,
        items: {
          create: lineSnapshots.map((snap) => ({
            productId: snap.productId,
            productName: snap.productName,
            sku: snap.sku,
            quantity: snap.quantity,
            price: snap.unitPrice,
            lineTotal: snap.lineTotal,
          })),
        },
      },
    });

    // 4. Update Inventory (Decrement Stock)
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          quantity: { decrement: item.quantity },
        },
      });
    }

    // 5. Clear the Cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // 6. Create Initial Audit Log (OrderEvent)
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        previousStatus: null,
        nextStatus: OrderStatus.IN_PROCESS,
        actorId: validated.userId,
        actorRole: "USER",
        notes: "Order created successfully from checkout",
      },
    });

    return order;
  });
}
