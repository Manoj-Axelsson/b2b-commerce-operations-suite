import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { WishlistProvider } from "@/components/wishlist/WishlistContext";
import Navbar from "@/components/layout/Navbar";
import { getSession } from "@/lib/session";

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rajput Foods Sweden",
  description: "Quality you can trust. Service defined by integrity",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

// Peer Review: Ensure Navbar is positioned ABOVE all pages [cite: 6]
const RootLayout = async ({ children }: RootLayoutProps) => {
  const session = await getSession();

  return (
    <html lang="en" className={`${ebGaramond.variable} subpixel-antialiased`}>
      <body className="min-h-screen bg-background font-serif">
        <CartProvider>
          <WishlistProvider>
            {/* Sticky navbar — above all pages per DX spec */}
            <Navbar session={session} />

            <main>
              {children}
            </main>

          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
};

export default RootLayout;