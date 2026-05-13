import { z } from "zod";

export const createOrderFromCartSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  addressId: z.string().uuid("Invalid Address ID"),
  idempotencyKey: z.string().optional(),
});

export type CreateOrderFromCartValidated = z.infer<typeof createOrderFromCartSchema>;
