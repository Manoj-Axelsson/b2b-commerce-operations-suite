'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
    name: string;
}

const ProductGallery = ({ images, name }: ProductGalleryProps) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [hasError, setHasError] = useState(false);

    const formattedImages = (images || []).map(img => 
        (img && !img.startsWith('http') && !img.startsWith('/')) ? `/${img}` : img
    ).filter(Boolean);

    // Reset error if active index or images change
    useEffect(() => {
        setHasError(false);
    }, [activeIndex, images]);

    if (formattedImages.length === 0) {
        return (
            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-border bg-brand-cream shadow-sm flex items-center justify-center">
                <div className="relative w-[90%] h-[90%] flex items-center justify-center transition-all duration-300 border border-brand-border/60 rounded-2xl shadow-sm bg-white overflow-hidden ring-1 ring-black/5">
                    <Image
                        src="/default_product_list.jpg"
                        alt={name}
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-contain group-hover:scale-105 transition-transform duration-700"
                        priority
                        loading="eager"
                    />
                </div>
            </div>
        );
    }

    const nextImage = () => setActiveIndex((prev) => (prev + 1) % formattedImages.length);
    const prevImage = () => setActiveIndex((prev) => (prev - 1 + formattedImages.length) % formattedImages.length);

    return (
        <div className="flex flex-col gap-3 sm:gap-4">
            <div className="group relative aspect-square w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-brand-border bg-white shadow-sm transition-shadow hover:shadow-md">
                <Image
                    src={hasError ? "/default_product_list.jpg" : formattedImages[activeIndex]}
                    alt={`${name} - View ${activeIndex + 1}`}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-contain p-6 sm:p-8 transition-transform duration-700 group-hover:scale-105"
                    priority
                    loading="eager"
                    onError={() => setHasError(true)}
                />

                {formattedImages.length > 1 && (
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

            {formattedImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Product images">
                    {formattedImages.map((img, idx) => (
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
                            <Image src={img} alt="" fill sizes="80px" className="object-cover" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
