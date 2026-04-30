import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

export const useWishlist = () => {
  const { data: session } = authClient.useSession();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const isVerified = session?.user?.emailVerified ?? false;

  const fetchWishlist = useCallback(async () => {
    if (!isVerified) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/wishlist");
      if (response.ok) {
        const data = await response.json();
        setWishlistIds(new Set(data.productIds));
      }
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
    } finally {
      setIsLoading(false);
    }
  }, [isVerified]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId: string) => {
    if (!isVerified) return;

    const isCurrentlyWishlisted = wishlistIds.has(productId);
    const action = isCurrentlyWishlisted ? "remove" : "add";

    // Optimistic update
    setWishlistIds((prev) => {
      const newSet = new Set(prev);
      if (isCurrentlyWishlisted) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    try {
      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, action }),
      });

      if (!response.ok) {
        // Revert on failure
        fetchWishlist();
      }
    } catch (error) {
      console.error(`Failed to ${action} wishlist item`, error);
      // Revert on failure
      fetchWishlist();
    }
  };

  const isWishlisted = useCallback(
    (productId: string) => wishlistIds.has(productId),
    [wishlistIds]
  );

  return {
    wishlistIds,
    isLoading,
    isVerified,
    toggleWishlist,
    isWishlisted,
  };
};
