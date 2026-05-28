import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { cn } from "@/lib/utils";
import { Product } from "@/types/shop";

interface ProductCardActionProps {
    product: Product;
    isApproved: boolean;
    isInStock: boolean;
    isDiscounted: boolean;
}


export const ProductCardAction = ({
    product,
    isApproved,
    isInStock,
    isDiscounted,
}: ProductCardActionProps) => {
    return (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 relative min-h-[36px] overflow-hidden">
            {isApproved ? (
                <div className="relative w-full h-[36px]">
                    {/* Passive Badge (shown by default, hidden on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 transform group-hover:opacity-0 group-hover:translate-y-4 opacity-100 translate-y-0">
                        <div className={cn(
                            "flex items-center justify-center gap-2 w-full rounded-full px-5 py-2 font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg",
                            !isInStock 
                                ? "bg-brand-border text-muted-foreground cursor-not-allowed shadow-none border-none" 
                                : "text-white bg-linear-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark border-none"
                        )}>
                            {!isInStock 
                                ? "Out of stock" 
                                : isDiscounted 
                                    ? "Offer Available" 
                                    : "In Stock"}
                        </div>
                    </div>

                    {/* Interactive Add to Cart Button (hidden by default, shown on hover) */}
                    <div className="absolute inset-0 flex items-center justify-center transition-all duration-500 transform group-hover:opacity-100 group-hover:translate-y-0 opacity-0 -translate-y-4 pointer-events-none group-hover:pointer-events-auto">
                        <AddToCartButton product={product} className="w-full" />
                    </div>
                </div>
            ) : (
                <Link
                    href="/login"
                    className={cn(
                        "flex items-center justify-center gap-2 w-full rounded-full px-5 py-2 font-bold text-[11px] uppercase tracking-widest transition-all duration-300 shadow-lg",
                        !isInStock 
                            ? "bg-brand-border text-muted-foreground cursor-not-allowed shadow-none border-none" 
                            : "text-white bg-linear-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark border-none hover:brightness-110"
                    )}
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
    );
};
