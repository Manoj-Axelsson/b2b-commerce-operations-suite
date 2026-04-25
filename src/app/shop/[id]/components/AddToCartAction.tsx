'use client';

import { useState } from "react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";

interface AddToCartActionProps {
    productId: string;
    basePrice: number;
    discountPrice?: number | null;
    quantity: number;
    isLoggedIn: boolean;
    isApproved: boolean;
}

const AddToCartAction = ({
    productId: _productId,
    basePrice,
    discountPrice,
    quantity,
    isLoggedIn,
    isApproved
}: AddToCartActionProps) => {
    const [isAdding, setIsAdding] = useState(false);
    const isInStock = quantity > 0;
    const displayPrice = discountPrice ?? basePrice;

    const handleAddToCart = async () => {
        if (!isInStock || !isApproved) return;

        setIsAdding(true);
        // TODO(#7): Replace with actual cart logic
        setTimeout(() => setIsAdding(false), 800);
    };

    return (
        <div className="flex flex-col gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-brand-border">
            <div className="flex flex-col">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                    Price Total
                </span>
                <div className="flex items-baseline gap-3">
                    {isLoggedIn ? (
                        isApproved ? (
                            <>
                                <span className="text-2xl sm:text-3xl font-bold text-brand-gold-dark font-sans">
                                    {formatCurrency(displayPrice)}
                                </span>
                                {discountPrice && (
                                    <span className="text-muted-foreground line-through text-sm">
                                        {formatCurrency(basePrice)}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="text-lg font-bold text-muted-foreground italic">
                                Pending admin approval
                            </span>
                        )
                    ) : (
                        <Link href="/login" className="text-lg font-bold text-brand-gold-dark hover:underline">
                            Sign in to view price
                        </Link>
                    )}
                </div>
            </div>

            {isLoggedIn ? (
                isApproved ? (
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
                        {isAdding ? "Adding..." : isInStock ? "Add to Cart" : "Out of Stock"}
                    </button>
                ) : (
                    <button
                        disabled
                        className="w-full sm:w-72 py-3 sm:py-4 rounded-full font-bold uppercase tracking-[0.15em] text-sm bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                    >
                        Awaiting Approval
                    </button>
                )
            ) : (
                <Link
                    href="/login"
                    className="flex items-center justify-center gap-2 w-full sm:w-72 rounded-full px-6 py-3 sm:py-4 font-bold text-sm uppercase tracking-widest transition-all duration-300 bg-brand-border text-brand-primary hover:bg-brand-cream border border-brand-border/60"
                >
                    Sign in to order
                </Link>
            )}

            {!isInStock && (
                <p className="text-xs text-destructive italic font-medium" role="status">
                    This item is currently unavailable.
                </p>
            )}
        </div>
    );
};

export default AddToCartAction;
