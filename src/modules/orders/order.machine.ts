import { OrderStatus } from '@/generated/prisma/client';

export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  IN_PROCESS: [
    OrderStatus.AWAITING_PAYMENT,
    OrderStatus.CANCELLED,
  ],

  AWAITING_PAYMENT: [
    OrderStatus.CONFIRMED,
    OrderStatus.CANCELLED,
  ],

  CONFIRMED: [
    OrderStatus.SHIPPED,
    OrderStatus.CANCELLED,
  ],

  SHIPPED: [
    OrderStatus.DELIVERED,
  ],

  DELIVERED: [],

  CANCELLED: [],
};