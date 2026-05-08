import { z } from "zod";

export const createOrderFromCartSchema = z.object({
  userId: z.string().uuid("Invalid User ID"),
  addressId: z.string().uuid("Invalid Address ID"),
});

export type CreateOrderFromCartValidated = z.infer<typeof createOrderFromCartSchema>;
