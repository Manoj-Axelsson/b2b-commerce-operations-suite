"use client";

import { useWishlistContext } from "@/components/wishlist/WishlistContext";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export const WishlistButton = ({ productId, className }: WishlistButtonProps) => {
  const { isVerified, isWishlisted, toggleWishlist, isLoading } = useWishlistContext();

  // If the user's email is not verified, do not render the wishlist button at all.
  // We also don't render it while the initial state is loading to prevent layout shifts.
  if (!isVerified || isLoading) {
    return null;
  }

  const wishlisted = isWishlisted(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      className={cn(
        "absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300 shadow-md",
        "hover:scale-110 active:scale-95",
        wishlisted
          ? "bg-brand-cream text-red-500 hover:bg-red-50"
          : "bg-white/80 text-gray-400 hover:bg-white hover:text-red-400 backdrop-blur-sm",
        className
      )}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={wishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    </button>
  );
};
