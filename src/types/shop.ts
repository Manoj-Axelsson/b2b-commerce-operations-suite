
// TODO - (#7):  Replace with Prisma Product type once product features are finalized


export interface Product {
    id: string;
    name: string;
    brand: string;
    articleNo: string;
    weightValue: number;
    weightUnit: string;
    price: number;
    discountPrice?: number | null;
    imageUrl?: string | null;
    quantity: number;
}

export interface ProductCardProps {
    product: Product;
    priority?: boolean;
    isLoggedIn: boolean;
}

export interface ProductGridProps {
    products: Product[];
    categoryName?: string;
    isEmpty?: boolean;
    isLoggedIn: boolean;
}
