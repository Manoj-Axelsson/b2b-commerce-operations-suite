"use client";

import Image from "next/image";
import { useState } from "react";
import { normalizeProductImagePath } from "@/lib/utils";

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
    const [prevImageUrl, setPrevImageUrl] = useState(imageUrl);

    if (imageUrl !== prevImageUrl) {
        setPrevImageUrl(imageUrl);
        setHasError(false);
    }

    const formattedImageUrl = normalizeProductImagePath(imageUrl);

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
            loading={priority || isFallback ? "eager" : undefined}
            onError={() => setHasError(true)}
        />
    );
};
