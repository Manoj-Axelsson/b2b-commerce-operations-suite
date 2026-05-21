import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { BusinessError } from "@/lib/error";
import { runManagedTransaction } from "@/lib/managedTransaction";
import { ORDER_TRANSITIONS } from "./order.machine";
import { orderRepository } from "./order.repository";
import { OrderWithHistory, UpdateStatusParams } from "./order.types";
import { updateStatusSchema } from "./order.validators";
import { enqueueNotification } from "@/modules/notifications/notification.service";

/**
 * Service to orchestrate order status updates.
 * Ensures validation, workflow compliance, transactional safety,
 * audit logging, and reliable notification dispatch via outbox.
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
  // 1. Validation
  const validated = updateStatusSchema.parse({ orderId, nextStatus, notes });

  // 2. Core execution inside transaction
  const execute = async (currentTx: Prisma.TransactionClient) => {
    // Fetch current state
    const order = await orderRepository.findById(validated.orderId, currentTx);
    if (!order) {
      throw new BusinessError(`Order ${validated.orderId} not found`, 404);
    }

    // Idempotency
    if (order.status === validated.nextStatus) {
      console.log(
          `[IDEMPOTENCY]: Order ${validated.orderId} already ${validated.nextStatus}. Skipping.`
      );
      return order;
    }

    // Validate transition
    const allowedTransitions = ORDER_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(validated.nextStatus)) {
      throw new BusinessError(
          `Illegal transition: ${order.status} → ${validated.nextStatus}`,
          422
      );
    }

    // Prepare update data
    const updateData: Prisma.OrderUpdateInput = {
      status: validated.nextStatus,
    };

    if (validated.nextStatus === OrderStatus.AWAITING_PAYMENT) {
      updateData.reviewedAt = new Date();
    }

    if (validated.nextStatus === OrderStatus.CONFIRMED) {
      const currentOrder = await currentTx.order.findUnique({
        where: { id: validated.orderId },
      });

      if (currentOrder?.paymentStatus !== "RECEIVED") {
        throw new BusinessError(
            "Cannot confirm order without verified payment receipt.",
            403
        );
      }

      updateData.paymentReceivedAt = new Date();
    }

    if (validated.nextStatus === OrderStatus.SHIPPED) {
      updateData.shippedAt = new Date();
    }

    if (validated.nextStatus === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    // Persist update
    const updatedOrder = await orderRepository.update(
        validated.orderId,
        updateData,
        currentTx
    );

    // Audit trail
    await orderRepository.createEvent(
        {
          orderId: validated.orderId,
          previousStatus: order.status,
          nextStatus: validated.nextStatus,
          actorId,
          actorRole,
          notes:
              validated.notes ??
              `Status changed from ${order.status} to ${validated.nextStatus}`,
        },
        currentTx
    );

    // ✅ OUTBOX: enqueue notification INSIDE transaction
    await enqueueNotification(
        {
          type: "ORDER_STATUS_UPDATE",
          payload: {
              orderId: validated.orderId,
              nextStatus: validated.nextStatus,
              notes: validated.notes,
              previousStatus: order.status
          },
          dedupeKey: `order:${validated.orderId}:status:${validated.nextStatus}`,
        },
        currentTx
    );

    return updatedOrder;
  };

  // 3. Execute transaction
  if (tx) {
    return execute(tx);
  }

  return runManagedTransaction(signal, execute);
}

export default updateOrderStatus;

/**
 * Service to retrieve full order history.
 */
export async function getOrderWithHistory(
    orderId: string
): Promise<OrderWithHistory | null> {
  return orderRepository.findWithHistory(orderId) as Promise<OrderWithHistory | null>;
}