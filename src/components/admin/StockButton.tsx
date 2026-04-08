"use client";

interface StockButtonProps {
    productId: string;
    currentStock: number;
}

export const StockButton = ({ productId, currentStock }: StockButtonProps) => {
    return (
        <span
            data-product-id={productId}
            className="inline-flex items-center justify-center min-w-[3rem] px-3 py-1 rounded-full text-sm font-bold tabular-nums bg-gray-100 text-gray-800"
        >
            {currentStock}
        </span>
    );
};
