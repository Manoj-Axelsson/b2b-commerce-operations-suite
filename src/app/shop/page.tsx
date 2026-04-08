import prisma from "@/lib/prisma";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Product } from "@/types/shop";

// This page fetches live data from the database on every request
// force-dynamic prevents Next.js from trying to pre-render it at build time
export const dynamic = "force-dynamic";

// Fetch all active products from the database
// isActive: true  — only show products enabled by admin
// isDeleted: false — exclude soft-deleted products
const ShopPage = async () => {
    const rawProducts = await prisma.product.findMany({
        where: {
            isActive: true,
            isDeleted: false,
        },
        orderBy: {
            name: "asc",
        },
    });

    // Map the Prisma result to the Product interface used by ProductGrid and ProductCard
    const products: Product[] = rawProducts.map((item) => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        articleNo: item.articleNo,
        weightValue: item.weightValue,
        weightUnit: item.weightUnit,
        price: item.price,
        discountPrice: item.discountPrice,
        imageUrl: item.imageUrl,
        quantity: item.quantity,
    }));

    return (
        <main className="min-h-screen bg-brand-cream py-8 px-4 sm:py-12 md:py-20 sm:px-6 md:px-8">
            <div className="max-w-7xl mx-auto">
                <ProductGrid
                    products={products}
                    categoryName="Our Shop"
                />
            </div>
        </main>
    );
};

export default ShopPage;
