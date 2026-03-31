/**
 * Product Interface (UI-Centric)
 * 
 * Defines the structure for products used in the browsing feature.
 * 
 * TODO: Replace with Prisma Product type once schema is merged
 */
export interface Product {
    id: string;
    name: string;
    brand: string;
    articleNo: string;
    weightValue: number;
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
