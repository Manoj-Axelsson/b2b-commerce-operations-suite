import { z } from "zod";
import { OrderStatus } from "@/generated/prisma/client";

export const orderIdSchema = z.string().uuid("Invalid order ID format");

export const updateStatusSchema = z.object({
  orderId: orderIdSchema,
  nextStatus: z.enum(OrderStatus),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
