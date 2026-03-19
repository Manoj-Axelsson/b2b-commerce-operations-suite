/**
 * Product Interface (UI-Centric)
 * 
 * Defines the structure for products used in the browsing feature.
 * This ensures the UI can build independently of the database schema state
 * during parallel development phases.
 */
export interface Product {
    id: string;
    name: string;
    brand: string;
    articleNo: string;
    weightValue: string | number;
    weightUnit: string;
    price: number; // In cents
    discountPrice?: number | null; // In cents
    imageUrl?: string | null;
    quantity: number;
}

/**
 * ProductCardProps
 */
export interface ProductCardProps {
    product: Product;
    priority?: boolean;
}

/**
 * ProductGridProps
 */
export interface ProductGridProps {
    products: Product[];
    categoryName?: string;
    isEmpty?: boolean;
}
