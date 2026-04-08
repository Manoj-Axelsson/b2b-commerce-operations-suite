// Represents a single cart item as returned from the API.
// product.quantity is the stock level — not the cart quantity.
export interface CartProduct {
    id: string;
    name: string;
    price: number;
    quantity: number; // stock level
}

export interface CartItem {
    productId: string;
    quantity: number; // how many are in the cart
    product: CartProduct;
}

// The shape returned by useCart
export interface CartState {
    items: CartItem[];
    loading: boolean;
    error: string | null;
    totalItems: number;
    totalPrice: number;
    addToCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    getCartQuantity: (productId: string) => number;
    isAtStockLimit: (productId: string) => boolean;
    refetch: () => Promise<void>;
}
