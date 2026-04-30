import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

export const useWishlist = () => {
  const { data: session, isPending } = authClient.useSession();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [hasFetched, setHasFetched] = useState(false);

  const isVerified = session?.user?.emailVerified ?? false;
  
  // Derive loading state to avoid synchronous state updates in effects
  const isLoading = isPending || (isVerified && !hasFetched);

  useEffect(() => {
    let ignore = false;
    
    async function loadWishlist() {
      try {
        const response = await fetch("/api/wishlist");
        if (response.ok) {
          const data = await response.json();
          if (!ignore) {
            setWishlistIds(new Set(data.productIds));
          }
        }
      } catch (error) {
        console.error("Failed to fetch wishlist", error);
      } finally {
        if (!ignore) {
          setHasFetched(true);
        }
      }
    }

    if (isVerified && !hasFetched) {
      loadWishlist();
    }
    
    return () => {
      ignore = true;
    };
  }, [isVerified, hasFetched]);

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
        const revertResponse = await fetch("/api/wishlist");
        if (revertResponse.ok) {
          const data = await revertResponse.json();
          setWishlistIds(new Set(data.productIds));
        }
      }
    } catch (error) {
      console.error(`Failed to ${action} wishlist item`, error);
      // Revert on failure
      const revertResponse = await fetch("/api/wishlist");
      if (revertResponse.ok) {
        const data = await revertResponse.json();
        setWishlistIds(new Set(data.productIds));
      }
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
