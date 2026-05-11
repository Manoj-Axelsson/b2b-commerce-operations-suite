"use client";

import { useCartContext } from "@/components/cart/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import { CartItem } from "@/types/cart";
import Link from "next/link";

// --- CartItemRow ---

interface CartItemRowProps {
    item: CartItem;
}

const CartItemRow = ({ item }: CartItemRowProps) => {
    const { updateQuantity, removeFromCart, isAtStockLimit } = useCartContext();

    const atStockLimit = isAtStockLimit(item.productId);

    return (
        <li className="flex items-start gap-4 py-4 border-b border-brand-border/40 last:border-0">
            <div className="flex-1 min-w-0">
                <p className="font-serif font-bold text-brand-primary text-sm leading-tight line-clamp-2">
                    {item.product.name}
                </p>
                <p className="text-xs text-brand-gold-dark font-bold mt-1">
                    {formatCurrency(item.product.price)} each
                </p>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-brand-cream rounded-full border border-brand-border overflow-hidden">
                    <button
                        id={`cart-decrease-${item.productId}`}
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label={`Decrease quantity of ${item.product.name}`}
                        className="w-8 h-8 flex items-center justify-center text-brand-primary hover:bg-brand-border/30 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M4 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H4.75A.75.75 0 014 10z" clipRule="evenodd" />
                        </svg>
                    </button>

                    <span
                        className="w-6 text-center text-sm font-bold text-brand-primary tabular-nums"
                        aria-live="polite"
                        aria-label={`Quantity: ${item.quantity}`}
                    >
                        {item.quantity}
                    </span>

                    <button
                        id={`cart-increase-${item.productId}`}
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={atStockLimit}
                        aria-label={`Increase quantity of ${item.product.name}`}
                        className={cn(
                            "w-8 h-8 flex items-center justify-center transition-colors",
                            atStockLimit
                                ? "text-muted-foreground cursor-not-allowed"
                                : "text-brand-primary hover:bg-brand-border/30"
                        )}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                        </svg>
                    </button>
                </div>

                <span className="text-sm font-bold text-brand-primary">
                    {formatCurrency(item.product.price * item.quantity)}
                </span>

                <button
                    id={`cart-remove-${item.productId}`}
                    onClick={() => removeFromCart(item.productId)}
                    aria-label={`Remove ${item.product.name} from cart`}
                    className="text-xs text-muted-foreground hover:text-red-600 transition-colors underline underline-offset-2"
                >
                    Remove
                </button>
            </div>
        </li>
    );
};

// --- CartDrawer ---

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CartDrawer = ({ isOpen, onClose }: CartDrawerProps) => {
    const { items, totalPrice, totalItems, clearCart, loading, error } = useCartContext();

    const isEmpty = !loading && !error && items.length === 0;

    return (
        <>
            <div
                id="cart-drawer-backdrop"
                role="presentation"
                onClick={onClose}
                className={cn(
                    "fixed inset-0 bg-black/40 z-40 transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
            />

            <aside
                id="cart-drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
                className={cn(
                    "fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl",
                    "flex flex-col transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
                    <h2 className="font-serif font-bold text-brand-primary text-xl">
                        Your Cart
                        {totalItems > 0 && (
                            <span className="ml-2 text-sm font-bold text-brand-gold-dark">
                                ({totalItems} {totalItems === 1 ? "item" : "items"})
                            </span>
                        )}
                    </h2>
                    <button
                        id="cart-close-button"
                        onClick={onClose}
                        aria-label="Close cart"
                        className="w-9 h-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-brand-cream hover:text-brand-primary transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6">
                    {loading && (
                        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                            Loading cart...
                        </div>
                    )}

                    {!loading && error && (
                        <div className="flex items-center justify-center h-full text-red-500 text-sm">
                            Failed to load cart. Please try again.
                        </div>
                    )}

                    {isEmpty && (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                            <div className="w-16 h-16 rounded-full bg-brand-cream border border-brand-border flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-muted-foreground" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.98-7.065a.75.75 0 00-.71-1.005H7.5m0 0l-.383-1.437M7.5 14.25L5.106 5.272M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="font-serif font-bold text-brand-primary text-lg">Your cart is empty</p>
                                <p className="text-muted-foreground text-sm mt-1">Add some products to get started.</p>
                            </div>
                        </div>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <ul className="divide-y-0">
                            {items.map((item) => (
                                <CartItemRow key={item.productId} item={item} />
                            ))}
                        </ul>
                    )}
                </div>

                {!loading && !error && items.length > 0 && (
                    <div className="px-6 py-5 border-t border-brand-border bg-white space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground text-sm font-medium">Total</span>
                            <span className="font-bold text-brand-primary text-xl tracking-tight">
                                {formatCurrency(totalPrice)}
                            </span>
                        </div>

                        <Link
                            href="/shop/checkout"
                            onClick={onClose}
                            className="block w-full text-center bg-brand-primary text-white font-bold uppercase tracking-widest py-3 rounded-full hover:bg-brand-gold-dark transition-colors duration-300 shadow-md"
                        >
                            Proceed to Checkout
                        </Link>

                        <button
                            id="cart-clear-button"
                            onClick={clearCart}
                            className="w-full text-sm text-muted-foreground hover:text-red-600 transition-colors underline underline-offset-2"
                        >
                            Clear cart
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};
