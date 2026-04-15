import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import ProductGallery from "./components/ProductGallery";
import AddToCartAction from "./components/AddToCartAction";

interface ProductPageProps {
    params: Promise<{ id: string }>;
}

const ProductDetailPage = async ({ params }: ProductPageProps) => {
    const { id } = await params;
    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        notFound();
    }

    return (
        <main className="max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16 sm:px-6 lg:px-8">
            <div className="mb-6 sm:mb-8">
                <Link
                    href="/products"
                    className="group inline-flex items-center text-sm font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-brand-gold-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark rounded-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                    Back to Catalog
                </Link>
            </div>

            <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
                <ProductGallery
                    images={product.images || []}
                    name={product.name}
                />

                <div className="mt-8 px-0 sm:mt-12 lg:mt-0">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-[0.2em]">
                            {product.brand}
                        </span>
                        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-brand-primary md:text-5xl">
                            {product.name}
                        </h1>
                    </div>

                    <div className="mt-4 sm:mt-6">
                        <h2 className="sr-only">Product information</h2>
                        <p className="text-sm italic text-muted-foreground">
                            Weight: {product.weightValue}{product.weightUnit}
                        </p>
                    </div>

                    <div className="mt-6 sm:mt-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-primary">
                            Description
                        </h3>
                        <div className="mt-3 sm:mt-4 space-y-6 text-base text-foreground leading-relaxed">
                            <p>{product.description || "No description available for this heritage selection."}</p>
                        </div>
                    </div>

                    <AddToCartAction
                        productId={product.id}
                        basePrice={product.price}
                        discountPrice={product.discountPrice}
                        quantity={product.quantity}
                    />

                    <div className="mt-8 sm:mt-10 border-t border-brand-border pt-4 sm:pt-6">
                        <p className="text-xs text-muted-foreground font-mono">
                            Article No: {product.articleNo}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetailPage;
