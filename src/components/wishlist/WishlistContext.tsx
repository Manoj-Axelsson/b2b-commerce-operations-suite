"use client";

import { createContext, useContext } from "react";
import { useWishlist } from "@/hooks/useWishlist";

type WishlistState = ReturnType<typeof useWishlist>;

const WishlistContext = createContext<WishlistState | null>(null);

interface WishlistProviderProps {
  children: React.ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const wishlist = useWishlist();

  return (
    <WishlistContext.Provider value={wishlist}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlistContext = (): WishlistState => {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlistContext must be used inside a <WishlistProvider>");
  }

  return context;
};
