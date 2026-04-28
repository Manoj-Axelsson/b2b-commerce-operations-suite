'use client';

import { useState } from "react";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartContext } from "@/components/cart/CartContext";

interface AddToCartActionProps {
    productId: string;
    basePrice: number;
    discountPrice?: number | null;
    quantity: number;
    // True only when the user is logged in AND has been approved by an admin.
    isApproved: boolean;
}

const AddToCartAction = ({
    productId,
    basePrice,
    discountPrice,
    quantity,
    isApproved,
}: AddToCartActionProps) => {
    const { addToCart, getCartQuantity, isAtStockLimit } = useCartContext();
    const [isAdding, setIsAdding] = useState(false);

    const isInStock = quantity > 0;
    const displayPrice = discountPrice ?? basePrice;
    const cartQuantity = getCartQuantity(productId);
    const atStockLimit = isAtStockLimit(productId);

    const handleAddToCart = async () => {
        if (!isInStock || atStockLimit || isAdding) return;

        setIsAdding(true);
        await addToCart(productId);
        setTimeout(() => setIsAdding(false), 600);
    };

    const isDisabled = !isInStock || atStockLimit || isAdding;

    const getLabel = () => {
        if (!isInStock) return "Out of Stock";
        if (atStockLimit) return "Max Stock Reached";
        if (isAdding) return "Added!";
        if (cartQuantity > 0) return `Add Again (${cartQuantity} in cart)`;
        return "Add to Cart";
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
                id={`add-to-cart-detail-${productId}`}
                onClick={handleAddToCart}
                disabled={isDisabled}
                aria-label={`${getLabel()} — product detail`}
                className={cn(
                    "w-full sm:w-72 py-3 sm:py-4 rounded-full font-bold uppercase tracking-[0.15em] text-sm transition-all duration-300 shadow-md hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark",
                    isDisabled
                        ? "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                        : "bg-brand-primary text-white hover:bg-brand-gold-dark active:scale-95 cursor-pointer",
                    isAdding && "bg-green-600 text-white",
                )}
            >
                {getLabel()}
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

