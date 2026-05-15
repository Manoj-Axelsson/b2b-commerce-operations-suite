import { ProductGridProps } from "@/types/shop";
import { ProductCard } from "./ProductCard";

export const ProductGrid = ({ products, categoryName, isEmpty, isApproved }: ProductGridProps) => {

    if (isEmpty || products.length === 0) {
        return (
            <div className="w-full py-20 flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                <div className="w-20 h-20 bg-brand-cream rounded-full flex items-center justify-center mb-6 border border-brand-border">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8 text-muted-foreground"
                        aria-hidden="true"
                        focusable="false"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                </div>
                <h3 className="text-brand-primary font-bold text-2xl font-serif mb-2">No items found</h3>
                <p className="text-muted-foreground max-w-xs">
                    {categoryName
                        ? `We currently don't have any products in the ${categoryName} category.`
                        : "Our catalog is currently being restocked. Please check back soon."}
                </p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {categoryName && (
                <div className="flex items-end gap-4 border-b border-brand-border pb-4">
                    <h2 className="text-brand-primary text-2xl sm:text-3xl md:text-4xl font-bold font-serif leading-none capitalize">
                        {categoryName}
                    </h2>
                    <span className="text-brand-gold-dark font-bold text-sm uppercase tracking-widest leading-none pb-1">
                        ({products.length} {products.length === 1 ? "Item" : "Items"})
                    </span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} isApproved={isApproved} priority={index < 4} />
                ))}
            </div>
        </div>
    );
};
