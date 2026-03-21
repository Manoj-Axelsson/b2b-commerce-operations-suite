/* Removed "use client" as interactivity is deferred */

import Image from "next/image";
import { ProductCardProps } from "@/types/shop";
import { formatCurrency, cn } from "@/lib/utils";

export const ProductCard = ({ product, priority }: ProductCardProps) => {
    const isInStock = product.quantity > 0;
    const isDiscounted = !!product.discountPrice && !!product.price;

    return (
        <div className={cn(
            "group relative bg-white/60 backdrop-blur-sm border border-brand-gold/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1",
            !isInStock && "opacity-90 grayscale-[0.3]"
        )}>

            {isDiscounted && (
                <div className="absolute top-4 left-4 z-10 bg-brand-gold-dark text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                    Special Offer
                </div>
            )}

            <div className="relative aspect-square w-full bg-brand-cream overflow-hidden">
                {product.imageUrl ? (
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                        priority={priority}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-primary/20">

                        <span className="text-4xl font-serif tracking-tighter italic">Rajput</span>
                    </div>
                )}

                {!isInStock && (
                    <div className="absolute inset-0 bg-brand-cream/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <span className="bg-brand-primary text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-[0.2em] shadow-lg">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            <div className="p-5 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-brand-gold uppercase tracking-[0.15em] mb-1 leading-tight">
                        {product.brand}
                    </span>
                    <span className="text-[10px] text-brand-primary/50 font-mono">
                        {product.articleNo}
                    </span>
                </div>

                <h3 className="text-brand-primary font-bold text-lg md:text-xl line-clamp-2 leading-tight font-serif min-h-10">
                    {product.name}
                </h3>

                <p className="text-brand-primary/60 text-xs italic mb-4">
                    {product.weightValue}{product.weightUnit}
                </p>

                <div className="flex items-center gap-3 mt-auto pt-2 border-t border-brand-gold/10">
                    <div className="flex flex-col">
                        {isDiscounted && product.discountPrice ? (
                            <>
                                <span className="text-brand-gold-dark font-bold text-xl tracking-tight">
                                    {formatCurrency(product.discountPrice)}
                                </span>
                                <span className="text-brand-primary/30 line-through text-xs -mt-1">
                                    {formatCurrency(product.price)}
                                </span>
                            </>
                        ) : (
                            <span className="text-brand-primary font-bold text-xl tracking-tight">
                                {formatCurrency(product.price)}
                            </span>
                        )}
                    </div>

                    {/* Add to Cart Trigger (Placeholder - Functional logic deferred to Order Management Story) */}
                    <button
                        disabled={!isInStock}
                        className={cn(
                            "ml-auto w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                            isInStock
                                ? "bg-brand-primary text-white hover:bg-brand-gold shadow-[0_4px_10px_rgba(28,10,92,0.2)] hover:shadow-[0_4px_15px_rgba(212,175,55,0.4)] cursor-pointer"
                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                        )}
                        aria-label="Add to cart (Placeholder)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};
