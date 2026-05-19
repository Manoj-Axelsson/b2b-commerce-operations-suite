"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * ShopHero Component
 * 
 * Renders the "3 promotion boxes" section for the /shop page.
 * Layout: 1 large box on the left (2/3 width on desktop) and 2 smaller boxes on the right.
 */
export function ShopHero() {
    return (
        <section className="w-full mb-12 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LARGE BOX: Biryani Recipe Mix */}
                <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-linear-to-br from-brand-saffron to-brand-cream border border-brand-border p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 shadow-sm group">
                    <div className="flex-1 space-y-6 z-10">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary text-white text-[10px] font-bold uppercase tracking-[0.2em]">
                            Big Offer
                        </span>
                        
                        <div className="space-y-2">
                            <h2 className="text-5xl md:text-6xl font-bold text-brand-primary font-serif leading-tight">
                                Biryani Recipe Mix
                            </h2>
                            <p className="text-brand-primary/70 text-lg font-medium max-w-sm">
                                Premium quality Shan products now available at exclusive member pricing.
                            </p>
                        </div>

                        <div className="flex items-center gap-6 pt-2">
                            <div className="flex flex-col">
                                <span className="text-3xl font-bold text-brand-gold-dark tracking-tight">
                                    7,50 SEK
                                </span>
                                <span className="text-sm text-muted-foreground line-through font-medium">
                                    Was 15,00 SEK
                                </span>
                            </div>
                            
                            <Link href="/shop">
                                <Button className="rounded-full px-10 py-7 bg-brand-primary text-white hover:scale-105 hover:bg-brand-primary/95 transition-all duration-300 font-bold uppercase tracking-[0.2em] text-xs shadow-lg border-none">
                                    Shop Now
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Image Container with decorative elements */}
                    <div className="relative w-72 h-72 md:w-96 md:h-96 shrink-0 flex items-center justify-center">
                        <div className="absolute inset-0 bg-white/40 rounded-full blur-3xl -z-10" />
                        <Image
                            src="/images/products/biryani-mix.png"
                            alt="Biryani Recipe Mix"
                            width={400}
                            height={400}
                            className="object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-700"
                            priority
                        />
                        {/* Decorative cards behind image as seen in reference */}
                        <div className="absolute inset-0 -z-10 flex items-center justify-center opacity-40">
                             <div className="w-4/5 h-4/5 bg-white rounded-2xl rotate-3 shadow-sm border border-brand-border/30" />
                             <div className="absolute w-4/5 h-4/5 bg-white rounded-2xl -rotate-6 shadow-sm border border-brand-border/30" />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Two Smaller Boxes */}
                <div className="flex flex-col gap-6">
                    
                    {/* TOP SMALL BOX: New Arrival */}
                    <div className="flex-1 rounded-[2.5rem] bg-linear-to-br from-brand-cream to-brand-saffron border border-brand-border p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-500">
                        <div className="space-y-4 z-10">
                            <span className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-[0.25em]">
                                New Arrival
                            </span>
                            <h3 className="text-3xl font-bold text-brand-primary font-serif leading-tight max-w-[12rem]">
                                Biryani Recipe Mix
                            </h3>
                            <Link 
                                href="/shop" 
                                className="inline-block text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] border-b-2 border-brand-gold-dark/30 hover:border-brand-primary pb-1 transition-colors"
                            >
                                Explore Launch
                            </Link>
                        </div>
                        
                        {/* Subtle background image */}
                        <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                            <Image
                                src="/images/products/biryani-mix.png"
                                alt=""
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* BOTTOM SMALL BOX: Limited Stock */}
                    <div className="flex-1 rounded-[2.5rem] bg-linear-to-br from-brand-cream to-brand-saffron border border-brand-border p-8 flex flex-col justify-between shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-500">
                        <div className="space-y-4 z-10">
                            <span className="text-[10px] font-bold text-brand-gold-dark uppercase tracking-[0.25em]">
                                Limited Stock
                            </span>
                            <h3 className="text-3xl font-bold text-brand-primary font-serif leading-tight">
                                Chili Pickle
                            </h3>
                            
                            <div className="flex items-end justify-between pt-2">
                                <Link 
                                    href="/shop" 
                                    className="inline-block text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] border-b-2 border-brand-gold-dark/30 hover:border-brand-primary pb-1 transition-colors"
                                >
                                    View Deal →
                                </Link>
                                <span className="text-2xl font-bold text-brand-gold-dark tracking-tight">
                                    19,00 SEK
                                </span>
                            </div>
                        </div>

                        {/* Subtle background image */}
                        <div className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
                            <Image
                                src="/images/products/chili-pickle.png"
                                alt=""
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
