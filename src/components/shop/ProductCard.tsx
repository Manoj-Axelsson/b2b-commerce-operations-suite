import Link from "next/link";
import { ProductCardProps } from "@/types/shop";
import { formatCurrency, cn } from "@/lib/utils";
import { ProductImage } from "./ProductImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export const ProductCard = ({ product, priority, isLoggedIn, isApproved }: ProductCardProps) => {
    const isInStock = product.quantity > 0;
    const isDiscounted = product.discountPrice != null && product.price != null && product.discountPrice < product.price;

    return (
        <article
            className={cn(
                "group relative flex flex-col bg-white border border-brand-border rounded-2xl overflow-hidden shadow-md transition-all duration-500",
                "hover:shadow-xl hover:-translate-y-1",
                !isInStock && "opacity-90 grayscale-[0.3]",
            )}
        >
            {/* Special Offer badge — only shown to logged-in users since it references pricing */}
            {isDiscounted && isLoggedIn && (
                <div className="absolute top-3 left-3 z-10 bg-brand-gold-dark text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md sm:top-4 sm:left-4">
                    Special Offer
                </div>
            )}

            {/* Clicking the image and info navigates to the product detail page */}
            <Link
                href={`/shop/${product.id}`}
                className="flex flex-col flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark rounded-2xl"
            >
                <div className="relative aspect-square w-full bg-brand-cream overflow-hidden">
                    {product.imageUrl ? (
                        <ProductImage
                            imageUrl={product.imageUrl}
                            name={product.name}
                            priority={priority}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-brand-border">
                            <span className="text-4xl font-serif tracking-tighter italic">Rajput</span>
                        </div>
                    )}

                    {!isInStock && (
                        <div className="absolute inset-0 bg-brand-cream/90 flex items-center justify-center z-10">
                            <span className="bg-brand-primary text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-[0.2em] shadow-lg">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </div>

                <div className="p-4 sm:p-5 flex flex-col gap-2 flex-1">
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-bold text-brand-gold-dark uppercase tracking-[0.15em] leading-tight">
                            {product.brand}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono shrink-0">
                            {product.articleNo}
                        </span>
                    </div>

                    <h3 className="text-brand-primary font-bold text-base sm:text-lg md:text-xl line-clamp-2 leading-tight font-serif min-h-10">
                        {product.name}
                    </h3>

                    <p className="text-muted-foreground text-xs italic">
                        {product.weightValue}{product.weightUnit}
                    </p>

                    <div className="mt-auto pt-2 border-t border-brand-border/40 min-h-8">
                        {isLoggedIn ? (
                            isApproved ? (
                                // Prices only shown to approved users
                                isDiscounted && product.discountPrice ? (
                                    <>
                                        <span className="text-brand-gold-dark font-bold text-lg sm:text-xl tracking-tight">
                                            {formatCurrency(product.discountPrice)}
                                        </span>
                                        <span className="text-muted-foreground line-through text-xs ml-2">
                                            {formatCurrency(product.price)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-brand-primary font-bold text-lg sm:text-xl tracking-tight">
                                        {formatCurrency(product.price)}
                                    </span>
                                )
                            ) : (
                                <span className="text-muted-foreground text-sm italic">
                                    Pending admin approval
                                </span>
                            )
                        ) : (
                            <span className="text-muted-foreground text-sm italic">
                                Sign in to view price
                            </span>
                        )}
                    </div>
                </div>
            </Link>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                {isLoggedIn ? (
                    isApproved ? (
                        <AddToCartButton product={product} className="w-full" />
                    ) : (
                        <button
                            disabled
                            className="flex items-center justify-center gap-2 w-full rounded-full px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all duration-300 bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        >
                            Awaiting Approval
                        </button>
                    )
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full rounded-full px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all duration-300 bg-brand-border text-brand-primary hover:bg-brand-cream border border-brand-border/60"
                    >
                        Sign in to order
                    </Link>
                )}
            </div>
        </article>
    );
};
