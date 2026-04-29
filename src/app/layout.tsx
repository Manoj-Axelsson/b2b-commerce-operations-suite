import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import Navbar from "@/components/layout/Navbar";

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
const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" className={`${ebGaramond.variable} subpixel-antialiased`}>
      <body className="min-h-screen bg-background font-serif">
        <CartProvider>
          {/* Sticky navbar — above all pages per DX spec */}
          <Navbar />

          <main>
            {children}
          </main>

        </CartProvider>
      </body>
    </html>
  );
};

export default RootLayout;