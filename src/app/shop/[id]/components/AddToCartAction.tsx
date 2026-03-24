'use client';

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";

interface AddToCartActionProps {
    productId: string;
    basePrice: number;
    discountPrice?: number | null;
    quantity: number;
}

const AddToCartAction = ({
    productId,
    basePrice,
    discountPrice,
    quantity
}: AddToCartActionProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const isInStock = quantity > 0;
    const displayPrice = discountPrice ?? basePrice;

    const handleAddToCart = async () => {
        if (!isInStock) return;

        setIsAdding(true);
        console.log(`Adding product ${productId} to cart at ${displayPrice} SEK`);
        setTimeout(() => setIsAdding(false), 800);
    };

    return (
        <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-brand-gold/10">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-brand-primary/40 uppercase tracking-widest mb-1">
                    Price Total
                </span>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-brand-gold-dark font-sans">
                        {formatCurrency(displayPrice)}
                    </span>
                    {discountPrice && (
                        <span className="text-brand-primary/30 line-through text-sm">
                            {formatCurrency(basePrice)}
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={handleAddToCart}
                disabled={!isInStock || isAdding}
                className={cn(
                    "w-full md:w-72 py-4 rounded-full font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 shadow-md hover:shadow-xl",
                    isInStock
                        ? "bg-brand-primary text-white hover:bg-brand-gold cursor-pointer"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                )}
            >
                {isAdding ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Adding...
                    </span>
                ) : isInStock ? (
                    "Add to Cart"
                ) : (
                    "Out of Stock"
                )}
            </button>

            {!isInStock && (
                <p className="text-xs text-red-500 italic font-medium">
                    * This item is currently unavailable in our heritage collection.
                </p>
            )}
        </div>
    );
};

export default AddToCartAction;