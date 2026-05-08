import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus, Prisma } from "@/generated/prisma/client";
import { createOrderFromCartSchema } from "./checkout.validators";
import { CheckoutLineSnapshot, CheckoutOrder, CreateOrderFromCartInput } from "./checkout.types";

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
 * 2. Fetch cart/address and validate stock (Read)
 * 3. Atomic Transaction:
 *    - Create Order & OrderItems
 *    - Decrement Inventory Stock
 *    - Clear Cart
 *    - Create initial Audit Log
 */
export async function createOrderFromCart(input: CreateOrderFromCartInput): Promise<CheckoutOrder> {
  const validated = createOrderFromCartSchema.parse(input);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // 1. Fetch Cart and Address
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

    if (!address) throw new Error("Delivery address not found or unauthorized");
    if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

    // 2. Validate Inventory and Prepare Snapshots
    const lineSnapshots: CheckoutLineSnapshot[] = cart.items.map((item) => {
      const p = item.product;
      if (!p.isActive || p.isDeleted) throw new Error(`Product ${p.name} is no longer available`);
      if (item.quantity > p.quantity) throw new Error(`Insufficient stock for ${p.name}`);

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
    const totalPrice = subtotalPrice; // Future: add shipping/tax logic here

    // 3. Create the Order
    const order = await tx.order.create({
      data: {
        userId: validated.userId,
        addressId: validated.addressId,
        status: OrderStatus.IN_PROCESS,
        paymentStatus: PaymentStatus.PENDING,
        subtotalPrice,
        adjustmentTotal: 0,
        totalPrice,
        deliveryStreet: normalizeStreet(address.street, address.houseNumber),
        items: {
          create: lineSnapshots.map((snap) => ({
            productId: snap.productId,
            quantity: snap.quantity,
            unitPrice: snap.unitPrice,
            totalPrice: snap.lineTotal,
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
