import { OrderStatus, PaymentStatus, Prisma } from "@/generated/prisma/client";
import { orderRepository } from "./order.repository";
import { ORDER_TRANSITIONS } from "./order.machine";
import { UpdateStatusParams, OrderWithHistory } from "./order.types";
import { runManagedTransaction } from "@/lib/managedTransaction";
import { BusinessError } from "@/lib/error";
import { enqueueNotification } from "@/modules/notifications/notification.service";

/**
 * Fetch an order with its full history: items, adjustments, and event trail.
 */
export async function getOrderWithHistory(id: string): Promise<OrderWithHistory | null> {
  return orderRepository.findWithHistory(id);
}

/**
 * Transition an order to a new status with all business guards enforced:
 *   - State-machine validity check (ORDER_TRANSITIONS)
 *   - Payment guard (CONFIRMED requires PaymentStatus.RECEIVED)
 *   - Full audit event written atomically alongside the update
 *
 * Supports transaction propagation: pass `tx` to join an existing transaction,
 * or omit to run inside a new managed transaction.
 */
export async function updateOrderStatus({
  orderId,
  nextStatus,
  actorId,
  actorRole,
  notes,
  shippingMethod,
  trackingNumber,
  estimatedArrivalDate,
  signal,
  tx,
}: UpdateStatusParams): Promise<void> {
  const execute = async (currentTx: Prisma.TransactionClient) => {
    // 1. Fetch current state
    const order = await orderRepository.findById(orderId, currentTx);
    if (!order) throw new BusinessError(`Order ${orderId} not found`, 404);

    // 2. State-machine guard
    const allowed = ORDER_TRANSITIONS[order.status];
    if (!allowed.includes(nextStatus)) {
      throw new BusinessError(
        `Illegal transition: ${order.status} → ${nextStatus}. Allowed: [${allowed.join(", ")}]`,
        422
      );
    }

    // 3. Payment guard — CONFIRMED requires payment to have been received
    if (nextStatus === OrderStatus.CONFIRMED) {
      const financial = await currentTx.order.findUnique({
        where: { id: orderId },
        select: { paymentStatus: true },
      });
      if (financial?.paymentStatus !== PaymentStatus.RECEIVED) {
        throw new BusinessError(
          "Order cannot be confirmed until payment is received.",
          422
        );
      }
    }

    // 4. Update the status & operational fields
    const updateData: Prisma.OrderUpdateInput = { status: nextStatus };
    if (nextStatus === OrderStatus.SHIPPED) {
      updateData.shippingMethod = shippingMethod;
      updateData.trackingNumber = trackingNumber;
      updateData.estimatedArrivalDate = estimatedArrivalDate;
      updateData.shippedAt = new Date();
    } else if (nextStatus === OrderStatus.DELIVERED) {
      updateData.deliveredAt = new Date();
    }

    await orderRepository.update(orderId, updateData, currentTx);

    // 5. Write audit event
    await orderRepository.createEvent(
      {
        orderId,
        previousStatus: order.status,
        nextStatus,
        actorId,
        actorRole,
        notes,
      },
      currentTx
    );

    // 6. Enqueue status update notification if transitioning to SHIPPED via COURIER
    if (nextStatus === OrderStatus.SHIPPED && shippingMethod === "COURIER") {
      await enqueueNotification(
        {
          type: "ORDER_STATUS_UPDATE",
          payload: {
            orderId,
            previousStatus: order.status,
            nextStatus,
            notes: notes ?? undefined,
          },
        },
        currentTx
      );
    }
  };

  if (tx) return execute(tx);
  return runManagedTransaction(signal, execute);
}
