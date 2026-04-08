"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { CartDrawer } from "./CartDrawer";

export const CartButton = () => {
    const { totalItems } = useCart();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const openDrawer = () => setIsDrawerOpen(true);
    const closeDrawer = () => setIsDrawerOpen(false);

    return (
        <>
            <button
                id="cart-icon-button"
                onClick={openDrawer}
                aria-label={`Open cart — ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
                className="relative flex items-center justify-center w-10 h-10 rounded-full text-brand-primary hover:bg-brand-cream transition-colors duration-200"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="w-6 h-6"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.98-7.065a.75.75 0 00-.71-1.005H7.5m0 0l-.383-1.437M7.5 14.25L5.106 5.272M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                </svg>

                {totalItems > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold-dark text-white text-xs font-bold rounded-full flex items-center justify-center leading-none"
                    >
                        {totalItems > 99 ? "99+" : totalItems}
                    </span>
                )}
            </button>

            <CartDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />
        </>
    );
};
