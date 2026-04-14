"use client";

import { createContext, useContext } from "react";
import { useCart } from "@/hooks/useCart";
import { CartState } from "@/types/cart";

// The context is typed as CartState | null.
// null means the component is being rendered outside of a CartProvider.
const CartContext = createContext<CartState | null>(null);

interface CartProviderProps {
    children: React.ReactNode;
}

// CartProvider owns the single instance of cart state for the whole app.
// Wrap the root layout body so every page and component shares the same cart.
export const CartProvider = ({ children }: CartProviderProps) => {
    const cart = useCart();

    return (
        <CartContext.Provider value={cart}>
            {children}
        </CartContext.Provider>
    );
};

// Safe hook for consuming cart state.
// Throws a clear error if called outside of a CartProvider.
export const useCartContext = (): CartState => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error("useCartContext must be used inside a <CartProvider>");
    }

    return context;
};
