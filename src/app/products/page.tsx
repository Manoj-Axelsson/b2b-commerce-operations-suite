import { ProductGrid } from "@/components/shop/ProductGrid";
import { Product } from "@/types/shop";

const MOCK_PRODUCTS: Product[] = [
    {
        id: "1",
        name: "Premium Basmati Rice",
        brand: "Rajput Foods",
        articleNo: "RF-B-001",
        weightValue: 5,
        weightUnit: "kg",
        price: 24900, // 249.00 SEK
        quantity: 50,
        imageUrl: null,
    },
    {
        id: "2",
        name: "Cold Pressed Mustard Oil",
        brand: "Rajput Foods",
        articleNo: "RF-O-500",
        weightValue: 500,
        weightUnit: "ml",
        price: 8900,
        discountPrice: 7500,
        quantity: 25,
        imageUrl: null,
    },
    {
        id: "3",
        name: "Wildflower Honey",
        brand: "Rajput Foods",
        articleNo: "RF-H-250",
        weightValue: 250,
        weightUnit: "g",
        price: 12000,
        quantity: 0,
        imageUrl: null,
    }
];

export default function ProductsPage() {
    return (
        <main className="min-h-screen bg-brand-cream/30 py-20 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <ProductGrid 
                    products={MOCK_PRODUCTS} 
                    categoryName="All Products"
                />
            </div>
        </main>
    );
}
