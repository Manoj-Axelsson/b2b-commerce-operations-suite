"use client";

import { useState } from "react";
import { useCartContext } from "@/components/cart/CartContext";
import { Product } from "@/types/shop";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
    product: Product;
    className?: string;
}

export const AddToCartButton = ({ product, className }: AddToCartButtonProps) => {
    const { addToCart, getCartQuantity, isAtStockLimit } = useCartContext();
    const [isAdding, setIsAdding] = useState(false);

    const isOutOfStock = product.quantity <= 0;
    const cartQuantity = getCartQuantity(product.id);
    const atStockLimit = isAtStockLimit(product.id);

    const handleAddToCart = async () => {
        if (isOutOfStock || atStockLimit || isAdding) return;

        setIsAdding(true);
        await addToCart(product.id);
        setTimeout(() => setIsAdding(false), 600);
    };

    const isDisabled = isOutOfStock || atStockLimit || isAdding;

    const getLabel = () => {
        if (isOutOfStock) return "Out of Stock";
        if (atStockLimit) return "Max Stock Reached";
        if (isAdding) return "Added!";
        if (cartQuantity > 0) return `Add Again (${cartQuantity} in cart)`;
        return "Add to Cart";
    };

    return (
        <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={isDisabled}
            aria-label={`${getLabel()} — ${product.name}`}
            className={cn(
                "flex items-center justify-center gap-2 rounded-full px-6 py-3",
                "font-bold text-sm uppercase tracking-widest transition-all duration-300",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark",
                isDisabled
                    ? "bg-brand-border text-muted-foreground cursor-not-allowed"
                    : "bg-brand-primary text-white hover:bg-brand-gold-dark active:scale-95 shadow-md hover:shadow-lg",
                isAdding && "bg-green-600 text-white",
                className,
            )}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 shrink-0"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.98-7.065a.75.75 0 00-.71-1.005H7.5m0 0l-.383-1.437M7.5 14.25L5.106 5.272M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
            </svg>
            <span>{getLabel()}</span>
        </button>
    );
};
