
export type DiscountUnitType = "PERCENTAGE" | "FIXED";

// Unified Input Structure for Shopping Cart Line Items.

export interface CartItemInput {
    productId: string;
    productName: string;
    quantity: number;
    price: number; // in cents
}

// Lean Promotion Rule (Product-only)

export interface PromotionRule {
    id: string;
    code: string;
    targetId: string; // productId
    discountUnit: DiscountUnitType;
    discountValue: number;
}

// Processed Line Item Result

export interface ProcessedLineItem extends CartItemInput {
    appliedDiscount: number;
    appliedPromotionCode: string | null;
    finalLineTotal: number;
}

// Final Engine Output

export interface PromotionCalculationResult {
    items: ProcessedLineItem[];
    subtotal: number;
}
