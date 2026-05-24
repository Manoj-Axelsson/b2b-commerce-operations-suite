
import { z } from "zod";

export const cartItemInputSchema = z.object({
    productId: z.string().uuid({ message: "Product ID must be a valid UUID" }),
    productName: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().int().nonnegative(), // cents
});

export const evaluateCartPromotionsSchema = z.object({
    items: z.array(cartItemInputSchema).min(1),
});

// Lean Promotion Rule Validation

export const promotionRuleSchema = z.object({
    id: z.string().uuid(),
    code: z.string().min(2).toUpperCase(),
    targetId: z.string().uuid(),
    discountUnit: z.enum(["PERCENTAGE", "FIXED"]),
    discountValue: z.number().int().positive(),
}).refine((data) => {
    if (data.discountUnit === "PERCENTAGE") {
        return data.discountValue <= 100;
    }
    return true;
}, {
    message: "Percentage discount cannot exceed 100%",
    path: ["discountValue"],
});

// Types

export type CartItemInputValidation = z.infer<typeof cartItemInputSchema>;
export type EvaluateCartPromotionsValidation = z.infer<typeof evaluateCartPromotionsSchema>;
export type PromotionRuleValidation = z.infer<typeof promotionRuleSchema>;
