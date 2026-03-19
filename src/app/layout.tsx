import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Rajput Foods Sweden",
  description: "Quality you can trust. Service defined by integrity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${garamond.variable} ${garamond.className} antialiased text-gray-900 bg-[#e9d9bf]/50 min-h-screen`}
      >
        <main className="flex flex-col min-h-screen">{children}</main>
      </body>
    </html>
  );
}
