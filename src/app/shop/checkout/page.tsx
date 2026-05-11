import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CheckoutClient } from "@/components/shop/CheckoutClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login?callbackUrl=/shop/checkout");
  }

  // Fetch Cart
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    redirect("/shop");
  }

  // Fetch Addresses
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const totalPrice = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <main className="min-h-screen bg-brand-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-8">
          <Link href="/shop" className="hover:text-brand-primary transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-brand-primary font-bold">Checkout</span>
        </nav>

        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-primary tracking-tight">
            Checkout
          </h1>
          <p className="text-muted-foreground mt-2">
            Review your items and select a delivery address.
          </p>
        </header>

        <CheckoutClient 
          items={cart.items} 
          totalPrice={totalPrice} 
          addresses={addresses} 
        />
      </div>
    </main>
  );
}
