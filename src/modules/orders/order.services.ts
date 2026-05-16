import { ORDER_TRANSITIONS } from "./order.machine";
import { orderRepository } from "./order.repository";
import { updateStatusSchema } from "./order.validators";
import { UpdateStatusParams, OrderWithHistory } from "./order.types";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { BusinessError } from "@/lib/error";
import { runManagedTransaction } from "@/lib/managedTransaction";

/**
 * Service to orchestrate order status updates.
 * Validates against Zod schema and Machine workflow before persisting via Repository.
 */
export async function updateOrderStatus({
  orderId,
  nextStatus,
  actorId,
  actorRole,
  notes,
  signal,
  tx,
}: UpdateStatusParams) {
  // 1. Validation Wrap (Input Safety)
  const validated = updateStatusSchema.parse({ orderId, nextStatus, notes });

  // 2. Logic implementation (DRY)
  const execute = async (currentTx: Prisma.TransactionClient) => {
    // Data Fetch (Current State)
    const order = await orderRepository.findById(validated.orderId, currentTx);
    if (!order) throw new BusinessError(`Order ${validated.orderId} not found`, 404);

    // Idempotency: If already in this status, return success
    if (order.status === validated.nextStatus) {
      console.log(`[IDEMPOTENCY]: Order ${validated.orderId} is already ${validated.nextStatus}. Skipping.`);
      return order;
    }

    // Workflow Rules Check (Machine)
    const allowedTransitions = ORDER_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(validated.nextStatus)) {
      throw new BusinessError(
        `Illegal transition: Cannot move from ${order.status} to ${validated.nextStatus}`,
        422
      );
    }

    // Data Preparation
    const updateData: Prisma.OrderUpdateInput = { status: validated.nextStatus };
    
    if (validated.nextStatus === OrderStatus.AWAITING_PAYMENT) {
      updateData.reviewedAt = new Date();
    }

    if (validated.nextStatus === OrderStatus.CONFIRMED) {
      // HIGH SECURITY: Verify payment received signal
      const currentOrder = await currentTx.order.findUnique({ where: { id: validated.orderId } });
      if (currentOrder?.paymentStatus !== "RECEIVED") {
        throw new BusinessError("Security Violation: Cannot confirm order without verified payment receipt.", 403);
      }
      updateData.paymentReceivedAt = new Date();
    }

    if (validated.nextStatus === OrderStatus.SHIPPED) updateData.shippedAt = new Date();
    if (validated.nextStatus === OrderStatus.DELIVERED) updateData.deliveredAt = new Date();

    // DB Persistence
    const updatedOrder = await orderRepository.update(validated.orderId, updateData, currentTx);

    // Audit Logging
    await orderRepository.createEvent({
      orderId: validated.orderId,
      previousStatus: order.status,
      nextStatus: validated.nextStatus,
      actorId,
      actorRole,
      notes: validated.notes ?? `Status changed from ${order.status} to ${validated.nextStatus}`,
    }, currentTx);

    return updatedOrder;
  };

  // 3. Execution Strategy: Join existing OR start new managed transaction
  let result: Awaited<ReturnType<typeof execute>>;
  if (tx) {
    result = await execute(tx);
  } else {
    result = await runManagedTransaction(signal, execute);
  }

  // 4. Post-Transaction Hooks: Send Customer Notification
  // We use Next.js 'after' to send the email without blocking the response
  try {
    const { after } = await import("next/server");
    after(async () => {
      try {
        const { sendOrderStatusUpdateEmail } = await import("@/modules/checkout/mail.service");
        await sendOrderStatusUpdateEmail(orderId, nextStatus, notes);
      } catch (error) {
        console.error(`[ORDER_EMAIL_HOOK]: Failed to notify customer of status change to ${nextStatus}`, error);
      }
    });
  } catch (_e) {
    // If 'after' is not available (e.g. background task), send synchronously
    const { sendOrderStatusUpdateEmail } = await import("@/modules/checkout/mail.service");
    await sendOrderStatusUpdateEmail(orderId, nextStatus, notes).catch(err => {
      console.error("[ORDER_EMAIL_SYNC]: Failed to send notification", err);
    });
  }

  return result;
}

/**
 * Service to retrieve full order history.
 */
export async function getOrderWithHistory(orderId: string): Promise<OrderWithHistory | null> {
  return orderRepository.findWithHistory(orderId) as Promise<OrderWithHistory | null>;
}
