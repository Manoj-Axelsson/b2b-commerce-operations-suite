'use client';

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";

interface AddToCartActionProps {
    productId: string;
    basePrice: number;
    discountPrice?: number | null;
    quantity: number;
    // True only when the user is logged in AND has been approved by an admin.
    isApproved: boolean;
}

const AddToCartAction = ({
    productId: _productId,
    basePrice,
    discountPrice,
    quantity,
    isApproved,
}: AddToCartActionProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const isInStock = quantity > 0;
    const displayPrice = discountPrice ?? basePrice;

    const handleAddToCart = async () => {
        if (!isInStock) return;

        setIsAdding(true);
        // TODO(#7): Replace with actual cart logic
        setTimeout(() => setIsAdding(false), 800);
    };

    // Non-approved users (guests or pending approval) cannot see price or add to cart
    if (!isApproved) {
        return (
            <div className="flex flex-col gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-brand-border">
                <p className="text-sm text-muted-foreground italic">
                    Your account is pending approval. Pricing and ordering will be available once an admin approves your account.
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-brand-border">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Price Total
                </span>
                <div className="flex items-baseline gap-3">
                    <span className="text-2xl sm:text-3xl font-bold text-brand-gold-dark font-sans">
                        {formatCurrency(displayPrice)}
                    </span>
                    {discountPrice && (
                        <span className="text-muted-foreground line-through text-sm">
                            {formatCurrency(basePrice)}
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={handleAddToCart}
                disabled={!isInStock || isAdding}
                className={cn(
                    "w-full sm:w-72 py-3 sm:py-4 rounded-full font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 shadow-md hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark",
                    isInStock
                        ? "bg-brand-primary text-white hover:bg-brand-gold-dark cursor-pointer"
                        : "bg-muted text-muted-foreground cursor-not-allowed shadow-none",
                )}
            >
                {isAdding ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />
                        Adding...
                    </span>
                ) : isInStock ? (
                    "Add to Cart"
                ) : (
                    "Out of Stock"
                )}
            </button>

            {!isInStock && (
                <p className="text-xs text-destructive italic font-medium" role="status">
                    This item is currently unavailable.
                </p>
            )}
        </div>
    );
};

export default AddToCartAction;
