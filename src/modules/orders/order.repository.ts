import prisma from "@/lib/prisma";
import { OrderStatus, Prisma } from "@/generated/prisma/client";
import { OrderWithHistory } from "./order.types";

/**
 * Repository for all direct database interactions.
 * Stabilized as the fourth layer in the module sequence.
 */
export const orderRepository = {
  /**
   * Basic fetch by ID.
   */
  async findById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
  },

  /**
   * Detailed fetch with items and event trail.
   */
  async findWithHistory(id: string, tx?: Prisma.TransactionClient): Promise<OrderWithHistory | null> {
    const client = tx || prisma;
    return client.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: true } },
        events: { orderBy: { createdAt: "desc" } },
        user: { select: { name: true, email: true } },
      },
    }) as Promise<OrderWithHistory | null>;
  },

  /**
   * Generic update for Order model.
   */
  async update(id: string, data: Prisma.OrderUpdateInput, tx?: Prisma.TransactionClient) {
    const client = tx || prisma;
    return client.order.update({
      where: { id },
      data,
    });
  },

  /**
   * Create an audit log record.
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
    return client.orderEvent.create({ data });
  },
};
