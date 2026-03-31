'use client';

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
    name: string;
}

const ProductGallery = ({ images, name }: ProductGalleryProps) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-3xl border border-brand-border bg-brand-cream text-muted-foreground">
                <span className="font-serif text-4xl italic tracking-tighter">Rajput</span>
            </div>
        );
    }

    const nextImage = () => setActiveIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setActiveIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div className="flex flex-col gap-3 sm:gap-4">
            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-border bg-white shadow-sm transition-shadow hover:shadow-md">
                <Image
                    src={images[activeIndex]}
                    alt={`${name} - View ${activeIndex + 1}`}
                    fill
                    className="object-contain p-6 sm:p-8 transition-transform duration-700 group-hover:scale-105"
                    priority
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-brand-gold-dark hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark"
                            aria-label="Previous image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 rounded-full bg-card/80 p-2 text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-brand-gold-dark hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark"
                            aria-label="Next image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Product images">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveIndex(idx)}
                            role="tab"
                            aria-selected={activeIndex === idx}
                            aria-label={`View image ${idx + 1}`}
                            className={cn(
                                "relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark",
                                activeIndex === idx ? "border-brand-gold-dark" : "border-transparent opacity-60 hover:opacity-100",
                            )}
                        >
                            <Image src={img} alt="" fill className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
