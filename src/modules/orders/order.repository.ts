import prisma from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma/client";

/**
 * Repository for Order-related database operations.
 * Following the repository pattern to isolate Prisma calls.
 */
export const orderRepository = {
  /**
   * Find a specific order by ID with basic fields.
   */
  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        totalPrice: true,
      },
    });
  },

  /**
   * Find order with detailed items and event history.
   */
  async findWithHistory(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.findUnique({
      where: { id },
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
  },

  /**
   * Updates only the status of an order.
   */
  async updateStatus(
    id: string,
    status: OrderStatus,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.order.update({
      where: { id },
      data: {
        status,
        ...(status === OrderStatus.SHIPPED ? { shippedAt: new Date() } : {}),
        ...(status === OrderStatus.DELIVERED ? { deliveredAt: new Date() } : {}),
      },
    });
  },

  /**
   * Creates an audit log entry for an order event.
   */
  async createEvent(
    data: {
      orderId: string;
      previousStatus: OrderStatus | null;
      nextStatus: OrderStatus;
      actorId: string;
      actorRole: string;
      notes?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx || prisma;
    return client.orderEvent.create({
      data,
    });
  },
};
