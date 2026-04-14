"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useCartContext } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

// Floating cart button fixed to the bottom-right corner on every page.
// Only rendered when the user has an active session — and never on the landing page.
export const GlobalCartButton = () => {
    const pathname = usePathname();
    const { data: session, isPending } = authClient.useSession();
    const { totalItems } = useCartContext();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Hide on the landing page — it's an entry/marketing screen, not a shopping page
    if (pathname === "/") return null;

    // Don't render while session is resolving or if the user is not signed in
    if (isPending || !session?.user) return null;

    return (
        <>
            <button
                id="global-cart-button"
                onClick={() => setIsDrawerOpen(true)}
                aria-label={`Open cart — ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-2xl bg-brand-primary text-white hover:bg-brand-gold-dark hover:scale-110 active:scale-95 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark"
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

                {/* Badge — only visible when there are items in the cart */}
                {totalItems > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -top-1 -right-1 w-5 h-5 bg-brand-gold-dark text-white text-xs font-bold rounded-full flex items-center justify-center leading-none border-2 border-white"
                    >
                        {totalItems > 99 ? "99+" : totalItems}
                    </span>
                )}
            </button>

            <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
        </>
    );
};
