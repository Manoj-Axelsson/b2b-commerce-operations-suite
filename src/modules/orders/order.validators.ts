import { z } from "zod";
import { OrderStatus } from "@/generated/prisma/client";

/**
 * Validation Layer: Final safety wrap for the Orders module.
 * Stabilized as the fifth and final step in the sequence.
 */
export const orderIdSchema = z.string().uuid("Invalid order ID format");

export const updateStatusSchema = z.object({
  orderId: orderIdSchema,
  nextStatus: z.enum(OrderStatus),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

/**
 * Types inferred from validators to ensure strict contract alignment.
 */
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
