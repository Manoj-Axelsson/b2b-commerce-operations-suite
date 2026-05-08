import { OrderStatus, Order, OrderItem, Product, OrderEvent, User } from "@/generated/prisma/client";

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export type OrderWithHistory = OrderWithItems & {
  events: OrderEvent[];
  user: Pick<User, "name" | "email">;
};

export interface UpdateStatusParams {
  orderId: string;
  nextStatus: OrderStatus;
  actorId: string;
  actorRole: string;
  notes?: string;
}
