"use client";

import { useState } from "react";
import { useCartContext } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

interface NavbarCartButtonProps {
  isAdmin: boolean;
  isApproved: boolean;
}

  // Cart icon rendered inside the Navbar — replaces the old floating GlobalCartButton.
  // Returns null for unapproved users, unless they are an admin.
  export const NavbarCartButton = ({ isAdmin, isApproved }: NavbarCartButtonProps) => {
    const { totalItems } = useCartContext();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
    if (!isAdmin && !isApproved) return null;

  return (
    <>
      <button
        id="navbar-cart-button"
        onClick={() => setIsDrawerOpen(true)}
        aria-label={`Open cart — ${totalItems} ${totalItems === 1 ? "item" : "items"}`}
        className="relative flex items-center justify-center text-white hover:text-brand-gold transition-colors duration-200"
      >
        {/* w-7 h-7 — one step larger than the old floating icon's w-6 h-6 */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="w-7 h-7"
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
            className="absolute -top-2 -right-2 w-5 h-5 bg-brand-gold text-brand-primary text-xs font-bold rounded-full flex items-center justify-center leading-none"
          >
            {totalItems > 99 ? "99+" : totalItems}
          </span>
        )}
      </button>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
};
