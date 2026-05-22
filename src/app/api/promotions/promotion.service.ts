
import { evaluatePromotions } from "./promotion.engine";
import { findActivePromotions } from "./promotion.repository";
import type { CartItemInput, DiscountUnitType, PromotionCalculationResult, PromotionRule } from "./promotion.types";

export const promotionService = {
    evaluateCartPromotions: async (
        items: CartItemInput[]
    ): Promise<PromotionCalculationResult> => {
        const now = new Date();

        // 1. Fetch active promotions (repository layer)
        const dbPromotions = await findActivePromotions(now);

        // 2. Transform DB → engine rules
        const activeRules: PromotionRule[] = dbPromotions.flatMap((promo: {
            products: { id: string }[];
            id: string;
            code: string;
            discountUnit: string;
            discountValue: unknown;
        }) =>
            promo.products.map((product) => ({
                id: promo.id,
                code: promo.code,
                targetId: product.id,
                discountUnit: promo.discountUnit as DiscountUnitType,
                discountValue: Number(promo.discountValue),
            }))
        );

        // 3. Evaluate
        return evaluatePromotions(items, activeRules);
    },
};
