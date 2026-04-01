"use client";

import Image from "next/image";
import { useState } from "react";

interface ProductImageProps {
    imageUrl: string;
    name: string;
    priority?: boolean;
}

// Client component so we can use useState to catch broken image URLs.
// If the image fails to load (e.g. file missing or URL broken),
// it falls back to the Rajput text placeholder — same as when imageUrl is null.
export const ProductImage = ({ imageUrl, name, priority }: ProductImageProps) => {
    const [hasError, setHasError] = useState(false);

    if (hasError) {
        return (
            <div className="w-full h-full flex items-center justify-center text-brand-border">
                <span className="text-4xl font-serif tracking-tighter italic">Rajput</span>
            </div>
        );
    }

    return (
        <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
            priority={priority}
            onError={() => setHasError(true)}
        />
    );
};
