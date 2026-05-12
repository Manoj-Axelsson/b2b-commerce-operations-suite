"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { CartItem, CartState } from "@/types/cart";

export function useCart(): CartState {
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const pathname = usePathname();

    const syncCart = useCallback(async () => {
        // The landing page has no cart UI and must not trigger cart logic/requests.
        if (pathname === "/") {
            setLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/cart");

            // 401 = guest (not logged in), 403 = logged in but not yet approved.
            // Both are expected states — treat as empty cart, no error.
            if (res.status === 401 || res.status === 403) {
                setItems([]);
                setError(null);
                return;
            }

            // Handle transient 404s gracefully ONLY in development.
            // This prevents console clutter when Turbopack is compiling routes.
            if (res.status === 404 && process.env.NODE_ENV === "development") {
                setItems([]);
                setError(null);
                return;
            }

            if (!res.ok) {
                throw new Error(`Failed to fetch cart (Status: ${res.status})`);
            }

            const data = await res.json();
            setItems(data?.items ?? []);
            setError(null);
        } catch (err) {
            // Only log if it's a real error (not expected guest/dev states)
            console.error("useCart sync error:", err instanceof Error ? err.message : err);
            setError("Failed to sync cart");
        } finally {
            setLoading(false);
        }
    }, [pathname]);

    useEffect(() => {
        // syncCart is async — setState is only called after awaiting fetch(),
        // never synchronously. The linter cannot detect this statically.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        syncCart();
    }, [syncCart]);

    const getCartQuantity = useCallback(
        (productId: string): number => {
            return items.find((i) => i.productId === productId)?.quantity ?? 0;
        },
        [items]
    );

    const isAtStockLimit = useCallback(
        (productId: string): boolean => {
            const item = items.find((i) => i.productId === productId);
            if (!item) return false;
            return item.quantity >= item.product.quantity;
        },
        [items]
    );

    const addToCart = useCallback(
        async (productId: string) => {

            setItems((prev) => {
                const existing = prev.find((i) => i.productId === productId);
                if (existing) {
                    return prev.map((i) =>
                        i.productId === productId
                            ? { ...i, quantity: i.quantity + 1 }
                            : i
                    );
                }

                return [...prev, { productId, quantity: 1, product: { id: productId, name: "", price: 0, quantity: 9999 } }];
            });

            try {
                const res = await fetch("/api/cart/add", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId }),
                });

                if (!res.ok) throw new Error("Add to cart failed");

                await syncCart();
            } catch (err) {
                console.error("Add to cart error:", err instanceof Error ? err.message : err);
                await syncCart();
            }
        },
        [syncCart]
    );

    const updateQuantity = useCallback(
        async (productId: string, quantity: number) => {
            // Optimistic update
            setItems((prev) =>
                prev.map((i) =>
                    i.productId === productId ? { ...i, quantity } : i
                )
            );

            try {
                const res = await fetch("/api/cart/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId, quantity }),
                });

                if (!res.ok) throw new Error("Update quantity failed");

                await syncCart();
            } catch (err) {
                console.error("Update quantity error:", err instanceof Error ? err.message : err);
                await syncCart();
            }
        },
        [syncCart]
    );

    const removeFromCart = useCallback(
        async (productId: string) => {

            setItems((prev) => prev.filter((i) => i.productId !== productId));

            try {
                const res = await fetch("/api/cart/remove", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId }),
                });

                if (!res.ok) throw new Error("Remove from cart failed");

                await syncCart();
            } catch (err) {
                console.error("Remove from cart error:", err instanceof Error ? err.message : err);
                await syncCart();
            }
        },
        [syncCart]
    );

    const clearCart = useCallback(async () => {
        setItems([]);
        try {
            const res = await fetch("/api/cart", { method: "DELETE" });
            if (!res.ok) throw new Error("Clear cart failed");
        } catch (err) {
            console.error("Clear cart error:", err instanceof Error ? err.message : err);
            await syncCart();
        }
    }, [syncCart]);

    const totalItems = useMemo(
        () => items.reduce((sum, i) => sum + i.quantity, 0),
        [items]
    );

    const totalPrice = useMemo(
        () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
        [items]
    );

    return {
        items,
        loading,
        error,
        totalItems,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartQuantity,
        isAtStockLimit,
        refetch: syncCart,
    };
}
