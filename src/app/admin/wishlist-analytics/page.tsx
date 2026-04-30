import prisma from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface WishlistAnalyticsProduct {
  id: string;
  name: string;
  brand: string;
  articleNo: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  _count: {
    wishlistedBy: number;
  };
  wishlistedBy: {
    createdAt: Date;
  }[];
}

export default async function WishlistAnalyticsPage() {
  const wishlistedProducts = await prisma.product.findMany({
    where: {
      wishlistedBy: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      brand: true,
      articleNo: true,
      price: true,
      imageUrl: true,
      quantity: true,
      _count: {
        select: {
          wishlistedBy: true,
        },
      },
      wishlistedBy: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
        select: {
          createdAt: true,
        },
      },
    },
  });

  // Prisma's relation count orderBy can sometimes be problematic depending on the driver,
  // so sorting in memory is perfectly fine here since it's just the products that are wishlisted.
  const sortedProducts = wishlistedProducts.sort((a: WishlistAnalyticsProduct, b: WishlistAnalyticsProduct) => b._count.wishlistedBy - a._count.wishlistedBy);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-serif text-brand-primary">Wishlist Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track product demand based on user wishlists to plan 3-day promotions and discounts.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-brand-cream border-b border-brand-border text-sm uppercase tracking-wider text-muted-foreground">
                <th className="p-4 font-bold">Product</th>
                <th className="p-4 font-bold">Current Price</th>
                <th className="p-4 font-bold">Stock</th>
                <th className="p-4 font-bold text-center">Wishlist Count</th>
                <th className="p-4 font-bold text-right">Most Recent Activity</th>
                <th className="p-4 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/50">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground italic">
                    No products have been wishlisted yet.
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-brand-cream/50 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        {product.imageUrl ? (
                          <div className="w-12 h-12 rounded-md bg-brand-cream shrink-0 overflow-hidden relative">
                            <Image 
                              src={product.imageUrl} 
                              alt={product.name} 
                              fill
                              sizes="48px"
                              className="object-cover" 
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-md bg-brand-cream shrink-0 flex items-center justify-center text-brand-border font-serif italic text-xs">
                            RF
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-brand-primary line-clamp-1">{product.name}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">
                            {product.brand} • {product.articleNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-brand-primary font-medium">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="p-4">
                      {product.quantity > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                          {product.quantity} in stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-10 h-8 px-3 rounded-full bg-brand-gold-dark text-white font-bold shadow-sm">
                        {product._count.wishlistedBy}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm">
                      {product.wishlistedBy[0]?.createdAt ? (
                        <div className="flex flex-col">
                          <span className="font-medium text-brand-primary">
                            {formatDistanceToNow(new Date(product.wishlistedBy[0].createdAt), { addSuffix: true })}
                          </span>
                          <span className="text-xs text-muted-foreground">Last added</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/admin/products?search=${product.articleNo}`}
                        className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-bold bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors shadow-sm"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
