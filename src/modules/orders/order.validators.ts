import { z } from "zod";
import { OrderStatus, AdjustmentType } from "@/generated/prisma/client";

/**
 * Validation Layer: Final safety wrap for the Orders module.
 * Stabilized as the fifth and final step in the sequence.
 */
export const orderIdSchema = z.string().uuid("Invalid order ID format");

export const updateStatusSchema = z.object({
  orderId: orderIdSchema,
  nextStatus: z.nativeEnum(OrderStatus),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export const addAdjustmentSchema = z.object({
  orderId: orderIdSchema,
  type: z.nativeEnum(AdjustmentType),
  amount: z.number().min(-1000000).max(1000000),
  description: z.string().max(255).optional(),
});

/**
 * Types inferred from validators to ensure strict contract alignment.
 */
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
