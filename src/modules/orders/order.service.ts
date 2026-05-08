import prisma from "@/lib/prisma";
import { OrderStatus } from "@/generated/prisma/client";
import { ORDER_TRANSITIONS } from "./order.machine";

/**
 * Updates the status of an order if the transition is legal.
 * Automatically logs the change in the OrderEvent table.
 * 
 * @param orderId - The unique ID of the order to update
 * @param nextStatus - The target status
 * @param actorId - The ID of the user or system performing the update
 * @param actorRole - The role of the actor (e.g., 'ADMIN', 'SYSTEM')
 * @param notes - Optional context for the status change
 */
export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  actorId: string,
  actorRole: string,
  notes?: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. Fetch current status
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const currentStatus = order.status;

    // 2. Validate transition
    const allowedTransitions = ORDER_TRANSITIONS[currentStatus];
    if (!allowedTransitions.includes(nextStatus)) {
      throw new Error(
        `Illegal transition: Cannot move order from ${currentStatus} to ${nextStatus}`
      );
    }

    // 3. Perform update
    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: { 
        status: nextStatus,
        // Set operational timestamps based on status
        ...(nextStatus === OrderStatus.SHIPPED ? { shippedAt: new Date() } : {}),
        ...(nextStatus === OrderStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
      },
    });

    // 4. Create audit event
    await tx.orderEvent.create({
      data: {
        orderId,
        previousStatus: currentStatus,
        nextStatus,
        actorId,
        actorRole,
        notes: notes ?? `Status changed from ${currentStatus} to ${nextStatus}`,
      },
    });

    return updatedOrder;
  });
}

/**
 * Retrieves an order with its full event history sorted by date.
 */
export async function getOrderWithHistory(orderId: string) {
  return await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      events: {
        orderBy: {
          createdAt: "desc",
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
}
