import Link from "next/link";
import { ProductCardProps } from "@/types/shop";
import { formatCurrency, cn } from "@/lib/utils";
import { ProductImage } from "./ProductImage";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { WishlistButton } from "@/components/wishlist/WishlistButton";

export const ProductCard = ({ product, priority, isApproved }: ProductCardProps) => {
    const isInStock = product.quantity > 0;
    const now = new Date();
    const isActiveOffer = product.discountPrice != null && 
        (!product.discountStart || now >= new Date(product.discountStart)) && 
        (!product.discountEnd || now <= new Date(product.discountEnd));

    const isDiscounted = isActiveOffer && product.price != null && product.discountPrice! < product.price;

    return (
        <article
            className={cn(
                "group relative flex flex-col bg-white border border-brand-border rounded-2xl overflow-hidden shadow-md transition-all duration-500",
                "hover:shadow-xl hover:-translate-y-1",
                !isInStock && "opacity-90 grayscale-[0.3]",
            )}
        >


            <WishlistButton productId={product.id} />

            {/* Clicking the image and info navigates to the product detail page */}
            <Link
                href={`/shop/${product.id}`}
                className="flex flex-col flex-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark rounded-2xl"
            >
                <div className="relative aspect-square w-full bg-brand-cream overflow-hidden">
                    <ProductImage
                        imageUrl={product.imageUrl}
                        name={product.name}
                        priority={priority}
                    />

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

                    <div className="flex items-center justify-between">
                        <p className="text-muted-foreground text-xs italic">
                            {product.weightValue}{product.weightUnit}
                        </p>
                        {isDiscounted && isApproved && (
                            <span className={cn(
                                "text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm",
                                product.discountType === "CLEARANCE" ? "bg-red-700" : "bg-brand-gold-dark"
                            )}>
                                {product.discountType?.replace("_", " ") || "Promotion"}
                            </span>
                        )}
                    </div>

                    <div className="mt-auto pt-2 border-t border-brand-border/40 min-h-8">
                        {isApproved ? (
                            // Prices are only visible to approved customers
                            isDiscounted && product.discountPrice !== null && product.discountPrice !== undefined ? (
                                <>
                                    <span className="text-brand-gold-dark font-bold text-lg sm:text-xl tracking-tight">
                                        {formatCurrency(product.discountPrice)}
                                    </span>
                                    <span className="text-muted-foreground line-through text-xs ml-2">
                                        {formatCurrency(product.price)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground ml-1.5 uppercase font-medium">exkl. moms</span>
                                </>
                            ) : (
                                <>
                                    <span className="text-brand-primary font-bold text-lg sm:text-xl tracking-tight">
                                        {formatCurrency(product.price)}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground ml-1.5 uppercase font-medium">exkl. moms</span>
                                </>
                            )
                        ) : (
                            // Guests and unapproved users see a prompt instead of the price
                            <span className="text-muted-foreground text-sm italic">
                                Log in to view price
                            </span>
                        )}
                        {isApproved && (
                            <p className="text-[9px] text-muted-foreground/80 mt-1.5 leading-normal">
                                Displayed prices exclude VAT. VAT added at checkout. / Priser exkl. moms. Moms tillkommer i kassan.
                            </p>
                        )}
                    </div>
                </div>
            </Link>

            <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                {isApproved ? (
                    <AddToCartButton product={product} className="w-full" />
                ) : (
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 w-full rounded-full px-6 py-3 font-bold text-sm uppercase tracking-widest transition-all duration-300 bg-brand-border text-brand-primary hover:bg-brand-cream border border-brand-border/60"
                        title="Log in to order"
                    >
                        {!isInStock 
                            ? "Out of stock" 
                            : isDiscounted 
                                ? "Offer Available" 
                                : "In Stock"}
                    </Link>
                )}
            </div>
        </article>
    );
};
