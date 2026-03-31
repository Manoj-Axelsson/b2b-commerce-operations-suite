import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

const garb = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${garb.variable} ${ebGaramond.variable} antialiased`}
    >
      <body className="min-h-screen bg-background font-sans">
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
