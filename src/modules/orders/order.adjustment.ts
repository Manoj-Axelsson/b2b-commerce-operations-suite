import { OrderStatus, Prisma, UserRole } from "@/generated/prisma/client";
import { BusinessError } from "@/lib/error";
import { runManagedTransaction } from "@/lib/managedTransaction";
import { orderRepository } from "./order.repository";
import { AddAdjustmentParams } from "./order.types";
import { addAdjustmentSchema, removeAdjustmentSchema } from "./order.validators";

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
  tx,
}: AddAdjustmentParams) {
  // 1. Validate Input
  const validated = addAdjustmentSchema.parse({ orderId, type, amount, description });

  const execute = async (currentTx: Prisma.TransactionClient) => {
    // 2. Fetch Order & Verify State
    const order = await orderRepository.findById(validated.orderId, currentTx);
    if (!order) throw new BusinessError(`Order ${validated.orderId} not found`, 404);

    // STRICT GUARD: Adjustments only allowed during IN_PROCESS
    if (order.status !== OrderStatus.IN_PROCESS) {
      throw new BusinessError(`Adjustments are locked for orders in ${order.status} state`, 422);
    }

    // 3. Create the Adjustment
    await orderRepository.createAdjustment({
      order: { connect: { id: validated.orderId } },
      type: validated.type,
      amount: validated.amount,
      description: validated.description,
      createdBy: actorId,
    }, currentTx);

    // 4. Recalculate Totals
    const adjustments = await orderRepository.getAdjustments(validated.orderId, currentTx);

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
    }, currentTx);

    // 6. Audit Logging
    await orderRepository.createEvent({
      orderId: validated.orderId,
      previousStatus: order.status,
      nextStatus: order.status,
      actorId,
      actorRole: UserRole.ADMIN,
      notes: `Financial Adjustment added: ${validated.type} (${validated.amount} SEK). Description: ${validated.description || "N/A"}`,
    }, currentTx);

    return updatedOrder;
  };

  if (tx) return execute(tx);
  return runManagedTransaction(signal, execute);
}

/**
 * Service to remove an adjustment and revert the totals.
 */
export async function removeOrderAdjustment(
  orderId: string,
  adjustmentId: string,
  actorId: string,
  signal?: AbortSignal,
  tx?: Prisma.TransactionClient
) {
  // Validate input using the schema
  const validated = removeAdjustmentSchema.parse({ orderId, adjustmentId });

  const execute = async (currentTx: Prisma.TransactionClient) => {
    // Fetch Order & Verify State
    const order = await orderRepository.findById(validated.orderId, currentTx);
    if (!order) throw new BusinessError(`Order ${validated.orderId} not found`, 404);

    // Check if financials are locked
    if (order.status !== OrderStatus.IN_PROCESS) {
      throw new BusinessError(`Financials are locked for orders in ${order.status} state`, 422);
    }

    // Delete adjustment
    await orderRepository.deleteAdjustment(validated.adjustmentId, currentTx);

    // Recalculate totals
    const adjustments = await orderRepository.getAdjustments(validated.orderId, currentTx);
    const adjustmentTotal = adjustments.reduce(
      (sum, adj) => sum.add(adj.amount as Prisma.Decimal),
      new Prisma.Decimal(0)
    );

    const subtotal = order.subtotalPrice ? new Prisma.Decimal(order.subtotalPrice as unknown as string) : new Prisma.Decimal(0);
    const totalPrice = subtotal.add(adjustmentTotal);

    // Update order financials
    await orderRepository.update(validated.orderId, {
      adjustmentTotal,
      totalPrice,
    }, currentTx);

    // Audit logging
    await orderRepository.createEvent({
      orderId: validated.orderId,
      previousStatus: order.status,
      nextStatus: order.status,
      actorId,
      actorRole: UserRole.ADMIN,
      notes: `Financial Adjustment removed: ${validated.adjustmentId}`,
    }, currentTx);
  };

  if (tx) return execute(tx);
  return runManagedTransaction(signal, execute);
}

export type RemoveOrderAdjustment = typeof removeOrderAdjustment;
