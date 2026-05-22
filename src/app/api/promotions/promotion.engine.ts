
import type {
    CartItemInput,
    PromotionRule,
    ProcessedLineItem,
    PromotionCalculationResult,
} from "./promotion.types";

export const evaluatePromotions = (
    items: CartItemInput[],
    promotions: PromotionRule[]
): PromotionCalculationResult => {

    const processedItems: ProcessedLineItem[] = items.map((item) => {
        // Simple deterministic rule: first match wins
        const promo = promotions.find(
            (p) => p.targetId === item.productId
        );

        const baseLineTotal = item.price * item.quantity;
        let appliedDiscount = 0;

        if (promo) {
            if (promo.discountUnit === "PERCENTAGE") {
                appliedDiscount = Math.round(
                    baseLineTotal * (promo.discountValue / 100)
                );
            } else {
                appliedDiscount = promo.discountValue * item.quantity;
            }

            // Safety cap
            if (appliedDiscount > baseLineTotal) {
                appliedDiscount = baseLineTotal;
            }
        }

        return {
            ...item,
            appliedDiscount,
            appliedPromotionCode: promo ? promo.code : null,
            finalLineTotal: baseLineTotal - appliedDiscount,
        };
    });

    const subtotal = processedItems.reduce(
        (acc, item) => acc + item.finalLineTotal,
        0
    );

    return {
        items: processedItems,
        subtotal,
    };
};
