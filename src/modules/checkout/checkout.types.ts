import { Order } from "@/generated/prisma/client";

export interface CreateOrderFromCartInput {
  userId: string;
  addressId: string;
}

export interface CheckoutLineSnapshot {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type CheckoutOrder = Order;
