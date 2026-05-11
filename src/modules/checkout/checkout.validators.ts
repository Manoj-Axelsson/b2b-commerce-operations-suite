import { z } from "zod";

export const createOrderFromCartSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  addressId: z.string().uuid("Invalid Address ID"),
});

export type CreateOrderFromCartValidated = z.infer<typeof createOrderFromCartSchema>;
