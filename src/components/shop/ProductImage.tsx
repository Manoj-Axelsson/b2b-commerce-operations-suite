"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

interface ProductImageProps {
    imageUrl: string | null | undefined;
    name: string;
    priority?: boolean;
}

// Client component so we can use useState to catch broken image URLs.
// If the image fails to load (e.g. file missing or URL broken) or is missing,
// it falls back to the refactored_logo.webp image.
export const ProductImage = ({ imageUrl, name, priority }: ProductImageProps) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [imageUrl]);

    let formattedImageUrl = imageUrl;
    if (formattedImageUrl && !formattedImageUrl.startsWith('http') && !formattedImageUrl.startsWith('/')) {
        formattedImageUrl = `/${formattedImageUrl}`;
    }

    const isFallback = hasError || !formattedImageUrl;
    const imgSrc = isFallback ? "/default_product_list.jpg" : formattedImageUrl as string;

    return (
        <Image
            src={imgSrc}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={`object-contain transition-transform duration-700 group-hover:scale-110 ${!isFallback ? "p-6" : ""}`}
            priority={priority}
            loading={priority ? "eager" : undefined}
            onError={() => setHasError(true)}
        />
    );
};
