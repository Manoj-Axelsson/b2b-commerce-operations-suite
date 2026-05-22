import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus } from "@/generated/prisma/client";
import { createOrderFromCartSchema } from "./checkout.validators";
import { CheckoutLineSnapshot, CheckoutOrder, CreateOrderFromCartInput } from "./checkout.types";
import { BusinessError } from "@/lib/error";
import { runManagedTransaction } from "@/lib/managedTransaction";
import { promotionService } from "@/app/api/promotions/promotion.service";

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
 */
export async function createOrderFromCart(input: CreateOrderFromCartInput): Promise<CheckoutOrder> {
  const { signal, ...rest } = input;
  const validated = createOrderFromCartSchema.parse(rest);
  const now = new Date();

  if (signal?.aborted) throw new BusinessError("Checkout cancelled by user", 499);

  // Idempotency
  if (validated.idempotencyKey) {
    const existingOrder = await prisma.order.findUnique({
      where: { idempotencyKey: validated.idempotencyKey },
      include: { items: true }
    });
    if (existingOrder) {
      console.log(`[IDEMPOTENCY]: Replaying existing order ${existingOrder.id}`);
      return existingOrder;
    }
  }

  if (signal?.aborted) throw new BusinessError("Checkout cancelled by user", 499);

  return runManagedTransaction(signal, async (tx) => {

    // Fetch cart
    const cart = await tx.cart.findUnique({
      where: { userId: validated.userId },
      include: {
        items: {
          include: { product: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart || cart.items.length === 0) throw new BusinessError("Cart is empty", 400);
    if (signal?.aborted) throw new BusinessError("Checkout cancelled during processing", 499);

    // Lock products (deadlock prevention)
    const productIds = Array.from(new Set(cart.items.map(item => item.productId))).sort();

    await tx.$executeRawUnsafe(
        `SELECT id FROM "product" WHERE id IN (${productIds.map((_, i) => `$${i + 1}`).join(",")}) ORDER BY id ASC FOR UPDATE`,
        ...productIds
    );

    // Fetch address
    const address = await tx.address.findFirst({
      where: {
        id: validated.addressId,
        userId: validated.userId,
      },
    });

    if (!address) throw new BusinessError("Delivery address not found", 400);

    // Build line snapshots
    const lineSnapshots: CheckoutLineSnapshot[] = cart.items.map((item) => {
      const p = item.product;

      if (!p.isActive || p.isDeleted) throw new BusinessError(`Product ${p.name} unavailable`, 422);
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

    // Convert → promotion input
    const cartItems = lineSnapshots.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.unitPrice,
    }));

    // APPLY PROMOTIONS (🔥 critical integration point)
    const promotionResult = await promotionService.evaluateCartPromotions(cartItems);

    // Totals
    const subtotalPrice = promotionResult.subtotal;

    const discountTotal = promotionResult.items.reduce(
        (acc, item) => acc + item.appliedDiscount,
        0
    );

    const totalPrice = subtotalPrice;

    // Create product lookup map (safe + efficient)
    const productMap = new Map(
        cart.items.map(ci => [ci.productId, ci.product])
    );

    // Create order
    const order = await tx.order.create({
      data: {
        userId: validated.userId,
        addressId: validated.addressId,
        idempotencyKey: validated.idempotencyKey,
        status: OrderStatus.IN_PROCESS,
        paymentStatus: PaymentStatus.PENDING,
        subtotalPrice,
        adjustmentTotal: discountTotal,
        totalPrice,
        deliveryStreet: normalizeStreet(address.street, address.houseNumber),
        deliveryCity: address.city,
        deliveryPostalCode: address.postalCode,
        deliveryCountry: address.country,
        items: {
          create: promotionResult.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            sku: productMap.get(item.productId)?.articleNo,
            quantity: item.quantity,
            price: item.price,
            lineTotal: item.finalLineTotal,
            discountApplied: item.appliedDiscount,
            appliedPromotionCode: item.appliedPromotionCode,
          })),
        },
      },
    });

    // Update inventory
    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { quantity: { decrement: item.quantity } },
      });
    }

    // Clear cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    // Audit log
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