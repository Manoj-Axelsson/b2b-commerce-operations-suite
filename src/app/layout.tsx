import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/cart/CartContext";
import { GlobalCartButton } from "@/components/cart/GlobalCartButton";

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

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang="en" className={`${ebGaramond.variable} antialiased`}>
      <body className="min-h-screen bg-background font-serif">
        <CartProvider>
          {children}
          <GlobalCartButton />
        </CartProvider>
      </body>
    </html>
  );
};

export default RootLayout;
