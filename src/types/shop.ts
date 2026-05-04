
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
    discountStart?: Date | null;
    discountEnd?: Date | null;
    discountType?: string | null;
    imageUrl?: string | null;
    quantity: number;
}

export interface ProductCardProps {
    product: Product;
    priority?: boolean;
    // True only when the user is logged in AND has been approved by an admin.
    // Controls price visibility and cart access.
    isApproved: boolean;
}

export interface ProductGridProps {
    products: Product[];
    categoryName?: string;
    isEmpty?: boolean;
    isApproved: boolean;
}
