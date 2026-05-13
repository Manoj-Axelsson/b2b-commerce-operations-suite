import { orderRepository } from "./order.repository";
import { addAdjustmentSchema } from "./order.validators";
import { AddAdjustmentParams } from "./order.types";
import { OrderStatus, UserRole, Prisma } from "@/generated/prisma/client";
import { runManagedTransaction } from "@/lib/managedTransaction";

/**
 * Service to handle financial adjustments (Discounts, Fees, etc.)
 */
export async function addOrderAdjustment({
  orderId,
  type,
  amount,
  description,
  actorId,
  signal,
}: AddAdjustmentParams) {
  // 1. Validate Input
  const validated = addAdjustmentSchema.parse({ orderId, type, amount, description });

  return runManagedTransaction(signal, async (tx) => {
    // 2. Fetch Order & Verify State
    const order = await orderRepository.findById(validated.orderId, tx);
    if (!order) throw new Error(`Order ${validated.orderId} not found`);
    
    // STRICT GUARD: Adjustments only allowed during IN_PROCESS
    if (order.status !== OrderStatus.IN_PROCESS) {
      throw new Error(`Adjustments are locked for orders in ${order.status} state`);
    }

    // 3. Create the Adjustment
    await orderRepository.createAdjustment({
      order: { connect: { id: validated.orderId } },
      type: validated.type,
      amount: validated.amount,
      description: validated.description,
      createdBy: actorId,
    }, tx);

    // 4. Recalculate Totals
    const adjustments = await orderRepository.getAdjustments(validated.orderId, tx);
    
    // Sum all adjustments
    const adjustmentTotal = adjustments.reduce(
      (sum, adj) => sum.add(adj.amount as Prisma.Decimal), 
      new Prisma.Decimal(0)
    );

    const subtotal = order.subtotalPrice ? new Prisma.Decimal(order.subtotalPrice as unknown as string) : new Prisma.Decimal(0);
    const totalPrice = subtotal.add(adjustmentTotal);

    // 5. Update Order Financials
    const updatedOrder = await orderRepository.update(validated.orderId, {
      adjustmentTotal,
      totalPrice,
    }, tx);

    // 6. Audit Logging
    await orderRepository.createEvent({
      orderId: validated.orderId,
      previousStatus: order.status,
      nextStatus: order.status, // Status hasn't changed, but state updated
      actorId,
      actorRole: UserRole.ADMIN,
      notes: `Financial Adjustment added: ${validated.type} (${validated.amount} SEK). Description: ${validated.description || "N/A"}`,
    }, tx);

    return updatedOrder;
  });
}

/**
 * Service to remove an adjustment and revert the totals.
 */
export async function removeOrderAdjustment(orderId: string, adjustmentId: string, actorId: string, signal?: AbortSignal) {
  return runManagedTransaction(signal, async (tx) => {
    const order = await orderRepository.findById(orderId, tx);
    if (!order) throw new Error(`Order ${orderId} not found`);
    
    if (order.status !== OrderStatus.IN_PROCESS) {
      throw new Error(`Financials are locked for orders in ${order.status} state`);
    }

    // Delete adjustment
    await orderRepository.deleteAdjustment(adjustmentId, tx);

    // Recalculate
    const adjustments = await orderRepository.getAdjustments(orderId, tx);
    const adjustmentTotal = adjustments.reduce(
      (sum, adj) => sum.add(adj.amount as Prisma.Decimal), 
      new Prisma.Decimal(0)
    );

    const subtotal = order.subtotalPrice ? new Prisma.Decimal(order.subtotalPrice as unknown as string) : new Prisma.Decimal(0);
    const totalPrice = subtotal.add(adjustmentTotal);

    await orderRepository.update(orderId, {
      adjustmentTotal,
      totalPrice,
    }, tx);

    await orderRepository.createEvent({
      orderId,
      previousStatus: order.status,
      nextStatus: order.status,
      actorId,
      actorRole: UserRole.ADMIN,
      notes: `Financial Adjustment removed. Totals recalculated.`,
    }, tx);
  });
}
