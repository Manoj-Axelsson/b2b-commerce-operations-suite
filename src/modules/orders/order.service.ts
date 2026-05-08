import prisma from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import { ORDER_TRANSITIONS } from "./order.machine";
import { orderRepository } from "./order.repository";
import { updateStatusSchema } from "./order.validators";

/**
 * Updates the status of an order if the transition is legal.
 * Automatically logs the change in the OrderEvent table.
 */
export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  actorId: string,
  actorRole: string,
  notes?: string
) {
  // 1. Validate Input Structure
  const validated = updateStatusSchema.parse({ orderId, nextStatus, notes });

  return await prisma.$transaction(async (tx) => {
    // 2. Fetch current status through repository
    const order = await orderRepository.findById(validated.orderId, tx);

    if (!order) {
      throw new Error(`Order ${validated.orderId} not found`);
    }

    const currentStatus = order.status;

    // 3. Validate transition legality
    const allowedTransitions = ORDER_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(validated.nextStatus)) {
      throw new Error(
        `Illegal transition: Cannot move order from ${currentStatus} to ${validated.nextStatus}`
      );
    }

    // 4. Perform update via repository
    const updatedOrder = await orderRepository.updateStatus(
      validated.orderId,
      validated.nextStatus,
      tx
    );

    // 5. Create audit event via repository
    await orderRepository.createEvent({
      orderId: validated.orderId,
      previousStatus: currentStatus,
      nextStatus: validated.nextStatus,
      actorId,
      actorRole,
      notes: validated.notes ?? `Status changed from ${currentStatus} to ${validated.nextStatus}`,
    }, tx);

    return updatedOrder;
  });
}

/**
 * Retrieves an order with its full event history.
 */
export async function getOrderWithHistory(orderId: string) {
  return orderRepository.findWithHistory(orderId);
}
