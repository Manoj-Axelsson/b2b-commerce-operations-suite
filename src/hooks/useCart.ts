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

    // Single declarative mutation primitive: set the cart line for a product to
    // a target quantity. The server clamps to stock and returns the authoritative
    // {quantity, stock}. All three public mutators are thin wrappers over this.
    const writeQuantity = useCallback(
        async (productId: string, target: number) => {
            // Optimistic local update — corrected by the server response below.
            setItems((prev) => {
                if (target <= 0) return prev.filter((i) => i.productId !== productId);
                const existing = prev.find((i) => i.productId === productId);
                if (existing) {
                    return prev.map((i) =>
                        i.productId === productId ? { ...i, quantity: target } : i
                    );
                }
                // Unknown product — high stock placeholder so isAtStockLimit
                // returns false until the next sync fills in real product data.
                return [
                    ...prev,
                    {
                        productId,
                        quantity: target,
                        product: { id: productId, name: "", price: 0, quantity: 9999 },
                    },
                ];
            });

            try {
                const res = await fetch("/api/cart/update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ productId, quantity: target }),
                });

                if (!res.ok) throw new Error(`Cart write failed (${res.status})`);

                const { quantity, stock } = (await res.json()) as {
                    productId: string;
                    quantity: number;
                    stock: number | null;
                };

                // Reconcile local state to the server's clamped quantity.
                const wasUnknown = !items.find((i) => i.productId === productId);
                setItems((prev) => {
                    if (quantity <= 0) return prev.filter((i) => i.productId !== productId);
                    const existing = prev.find((i) => i.productId === productId);
                    if (existing) {
                        return prev.map((i) =>
                            i.productId === productId
                                ? {
                                      ...i,
                                      quantity,
                                      product:
                                          stock != null
                                              ? { ...i.product, quantity: stock }
                                              : i.product,
                                  }
                                : i
                        );
                    }
                    return prev;
                });

                // First-time insert with no prior product row — pull the full record
                // (name/price) via a one-off sync.
                if (wasUnknown && quantity > 0) await syncCart();
            } catch (err) {
                console.error("Cart write error:", err instanceof Error ? err.message : err);
                await syncCart();
            }
        },
        [items, syncCart]
    );

    const addToCart = useCallback(
        async (productId: string) => {
            const current = items.find((i) => i.productId === productId)?.quantity ?? 0;
            await writeQuantity(productId, current + 1);
        },
        [items, writeQuantity]
    );

    const updateQuantity = useCallback(
        async (productId: string, quantity: number) => {
            await writeQuantity(productId, quantity);
        },
        [writeQuantity]
    );

    const removeFromCart = useCallback(
        async (productId: string) => {
            await writeQuantity(productId, 0);
        },
        [writeQuantity]
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
