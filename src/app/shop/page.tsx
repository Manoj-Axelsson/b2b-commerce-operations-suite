import { Suspense } from "react";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ShopFilters } from "@/components/shop/ShopFilters";
import { Product } from "@/types/shop";
import { sortProductsImagesFirst } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface ShopPageProps {
    searchParams: Promise<{
        name?: string;
        sort?: string;
        brand?: string;
        weight?: string;    // format: "10-kg"
        category?: string;  // categoryId
        offers?: string;    // "true" to show only discounted products
    }>;
}

const ShopPage = async ({ searchParams }: ShopPageProps) => {
    // Await searchParams (Next.js 16 async searchParams)
    const params = await searchParams;

    const {
        name     = "",
        sort     = "",
        brand    = "",
        weight   = "",
        category = "",
        offers   = "",
    } = params;

    // Check session server-side — price gating is enforced server-side
    const session = await auth.api.getSession({ headers: await headers() });

    let isApproved = false;

    if (session?.user?.id) {
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isApproved: true },
        });
        isApproved = dbUser?.isApproved ?? false;
    }

    // Parse weight param — stored as "10-kg" → { weightValue: 10, weightUnit: "kg" }
    let weightFilter: { weightValue: number; weightUnit: string } | undefined;
    if (weight) {
        const dashIndex = weight.lastIndexOf("-");
        const rawValue = parseInt(weight.slice(0, dashIndex), 10);
        const rawUnit  = weight.slice(dashIndex + 1);
        if (!isNaN(rawValue)) {
            weightFilter = { weightValue: rawValue, weightUnit: rawUnit };
        }
    }

    // Build the Prisma where clause from active filters
    const where = {
        isActive:  true,
        isDeleted: false,
        ...(name     ? { name:     { contains: name,  mode: "insensitive" as const } } : {}),
        ...(category ? { categoryId: category } : {}),
        ...(brand    ? { brand } : {}),
        ...(weightFilter ? { weightValue: weightFilter.weightValue, weightUnit: weightFilter.weightUnit } : {}),
        ...(offers === "true" ? { discountPrice: { not: null } } : {}),
    };

    // Build the orderBy clause — default to name A→Z
    const orderBy =
        sort === "price_asc"  ? { price: "asc"  as const } :
        sort === "price_desc" ? { price: "desc" as const } :
        { name: "asc" as const };

    const rawProducts = await prisma.product.findMany({ where, orderBy });

    // Map to the Product interface used by ProductGrid / ProductCard
    const mapped: Product[] = rawProducts.map((item) => ({
        id:           item.id,
        name:         item.name,
        brand:        item.brand,
        articleNo:    item.articleNo,
        weightValue:  item.weightValue,
        weightUnit:   item.weightUnit,
        price:        item.price,
        discountPrice: item.discountPrice,
        discountStart: item.discountStart,
        discountEnd:   item.discountEnd,
        discountType:  item.discountType,
        imageUrl:     item.imageUrl,
        quantity:     item.quantity,
    }));

    // Only apply image-first sort when no custom sort is active
    const products = sort ? mapped : sortProductsImagesFirst(mapped);

    // Fetch distinct brands and weights from active products for filter dropdowns
    const [distinctBrands, distinctWeights] = await Promise.all([
        prisma.product.findMany({
            where: { isActive: true, isDeleted: false },
            select: { brand: true },
            distinct: ["brand"],
            orderBy: { brand: "asc" },
        }),
        prisma.product.findMany({
            where: { isActive: true, isDeleted: false },
            select: { weightValue: true, weightUnit: true },
            distinct: ["weightValue", "weightUnit"],
            orderBy: [{ weightValue: "asc" }, { weightUnit: "asc" }],
        }),
    ]);

    const brands  = distinctBrands.map((b) => b.brand);
    const weights = distinctWeights.map((w) => `${w.weightValue}-${w.weightUnit}`);

    // Resolve active category name for display in the filter bar
    let categoryName: string | undefined;
    if (category) {
        const cat = await prisma.category.findUnique({
            where: { id: category },
            select: { name: true },
        });
        categoryName = cat?.name ?? undefined;
    }

    // Heading shown in ProductGrid
    const gridHeading = categoryName ?? "Our Shop";

    return (
        <main className="min-h-screen bg-brand-cream py-8 px-4 sm:py-12 md:py-20 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">

                {/* ShopFilters is a client component that uses useSearchParams —
                    wrap in Suspense to satisfy the Next.js streaming requirement */}
                <Suspense fallback={<div className="h-20 rounded-xl bg-white/50 animate-pulse mb-8" />}>
                    <ShopFilters
                        brands={brands}
                        weights={weights}
                        categoryName={categoryName}
                    />
                </Suspense>

                <ProductGrid
                    products={products}
                    categoryName={gridHeading}
                    isApproved={isApproved}
                />
            </div>
        </main>
    );
};

export default ShopPage;

