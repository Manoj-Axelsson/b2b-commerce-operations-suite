import { OrderStatus, Order, OrderItem, Product, OrderEvent, User, OrderAdjustment, AdjustmentType, Prisma } from "@/generated/prisma/client";

export type OrderWithItems = Order & {
  items: (OrderItem & { product: Product })[];
};

export type OrderWithHistory = OrderWithItems & {
  events: OrderEvent[];
  adjustments: OrderAdjustment[];
  user: Pick<User, "name" | "email">;
};

export interface UpdateStatusParams {
  orderId: string;
  nextStatus: OrderStatus;
  actorId: string;
  actorRole: string;
  notes?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  estimatedArrivalDate?: Date;
  signal?: AbortSignal;
  tx?: Prisma.TransactionClient;
}

export interface AddAdjustmentParams {
  orderId: string;
  type: AdjustmentType;
  amount: number;
  description?: string;
  actorId: string;
  signal?: AbortSignal;
  tx?: Prisma.TransactionClient;
}
