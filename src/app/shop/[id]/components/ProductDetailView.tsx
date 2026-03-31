import AddToCartAction from "./AddToCartAction";
import ProductGallery from "./ProductGallery";

interface ProductDetailViewProps {
    product: {
        id: string;
        name: string;
        description: string | null;
        price: number;
        brand: string | null;
        weightValue: number | null;
        weightUnit: string | null;
        articleNo: string | null;
        images?: string[];
        quantity: number;
        discountPrice?: number | null;
    };
}
const ProductDetailView = ({ product }: ProductDetailViewProps) => {
    const formattedPrice = new Intl.NumberFormat("sv-SE", {
        style: "currency",
        currency: "SEK",
        minimumFractionDigits: 0,
    }).format(product.price);

    return (
        <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
                <ProductGallery
                    images={product.images || []}
                    name={product.name}
                />

                <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
                    <div className="flex flex-col gap-2">
                        <span className="text-xs font-bold text-brand-gold uppercase tracking-[0.2em]">
                            {product.brand || "Rajput Heritage"}
                        </span>
                        <h1 className="font-serif text-4xl font-bold tracking-tight text-brand-primary md:text-5xl">
                            {product.name}
                        </h1>
                    </div>

                    <div className="mt-6">
                        <h2 className="sr-only">Product information</h2>
                        <p className="text-3xl font-sans text-brand-gold font-bold">
                            {formattedPrice}
                        </p>
                        {product.weightValue && (
                            <p className="mt-2 text-sm italic text-brand-primary/60">
                                Weight: {product.weightValue}{product.weightUnit}
                            </p>
                        )}
                    </div>

                    <div className="mt-8">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-brand-primary">
                            Description
                        </h3>
                        <div className="mt-4 space-y-6 text-base text-brand-primary/80 leading-relaxed">
                            <p>{product.description || "No description available for this heritage selection."}</p>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-brand-gold/10">
                        <AddToCartAction
                            productId={product.id}
                            basePrice={product.price}
                            discountPrice={product.discountPrice}
                            quantity={product.quantity}
                        />

                        {product.articleNo && (
                            <p className="mt-6 text-xs text-brand-primary/40 font-mono">
                                Article No: {product.articleNo}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ProductDetailView;