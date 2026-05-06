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
            <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-brand-cream to-white text-brand-primary/20">
                <span className="text-5xl font-serif tracking-tighter italic leading-none">Rajput</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.5em] mt-1 ml-2 opacity-50">Foods</span>
            </div>
        );
    }

    return (
        <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
            priority={priority}
            onError={() => setHasError(true)}
        />
    );
};
