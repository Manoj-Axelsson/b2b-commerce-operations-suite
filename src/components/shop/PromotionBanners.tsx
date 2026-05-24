import { Product } from "@/types/shop";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ProductImage } from "./ProductImage";

interface PromotionBannersProps {
    promotions: Product[];
    launches: Product[];
    isApproved: boolean;
}

export const PromotionBanners = ({ promotions, launches, isApproved }: PromotionBannersProps) => {
    const featured = promotions[0];
    const secondary = promotions[1];
    const launch = launches[0];

    if (!featured && !secondary && !launch) return null;

    return (
        <div className="relative">
            <section className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-12 animate-in fade-in slide-in-from-top-8 duration-700 relative z-10">
            {/* MAIN PROMOTION BANNER (60% width on desktop) */}
            {featured && (
                <div className="md:col-span-7 lg:col-span-8 relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-gold/20 via-brand-saffron to-brand-gold/30 text-brand-primary p-8 sm:p-12 min-h-[400px] flex flex-col justify-center group shadow-2xl border border-brand-gold">
                    <div className="absolute top-0 right-0 w-full h-full opacity-40 pointer-events-none bg-[radial-gradient(circle_at_70%_50%,_white_0%,_transparent_70%)]" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <span className="inline-block bg-brand-primary text-white px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg">
                                Big Offer
                            </span>
                            <h2 className="text-2xl sm:text-4xl font-serif font-bold leading-tight text-brand-primary">
                                {featured.name}
                            </h2>
                            <p className="text-brand-primary/70 text-xs sm:text-sm font-medium max-w-xs mx-auto md:mx-0">
                                Premium quality {featured.brand} products now available at exclusive member pricing.
                            </p>
                            
                            <div className="pt-4 flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
                                {isApproved && (
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-bold tracking-tighter text-brand-gold-dark">
                                            {formatCurrency(featured.discountPrice || featured.price)}
                                        </span>
                                        <span className="text-[10px] text-brand-primary/40 line-through">
                                            Was {formatCurrency(featured.price)}
                                        </span>
                                    </div>
                                )}
                                <Link 
                                    href={`/shop/${featured.id}`}
                                    className="bg-brand-primary text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-brand-gold-dark transition-all shadow-xl hover:scale-105"
                                >
                                    Shop Now
                                </Link>
                            </div>
                        </div>

                        {/* Product Image Spotlight */}
                        <div className="w-48 h-48 sm:w-64 sm:h-64 relative shrink-0">
                            <div className="absolute inset-0 bg-white rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-700 shadow-xl" />
                            <div className="absolute inset-0 bg-brand-cream rounded-3xl -rotate-3 group-hover:-rotate-6 transition-transform duration-700 shadow-lg overflow-hidden border-4 border-white">
                                <ProductImage 
                                    imageUrl={featured.imageUrl} 
                                    name={featured.name}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Decorative gold particles or blur */}
                    <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-brand-gold/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                </div>
            )}

            {/* SIDE BANNERS (40% width on desktop) */}
            <div className="md:col-span-5 lg:col-span-4 grid grid-cols-1 gap-4 relative group/side">
                {/* NEW LAUNCH BANNER */}
                {launch && (
                    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#fff7ed] via-[#ffedd5] to-[#fed7aa] text-[#7c2d12] p-6 flex flex-col justify-between group shadow-xl border border-brand-gold">
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#9a3412]/70">
                                New Arrival
                            </span>
                            <h3 className="text-xl font-serif font-bold mt-2 group-hover:text-[#ea580c] transition-colors leading-tight">
                                {launch.name}
                            </h3>
                        </div>
                        
                        <div className="relative z-10 mt-4">
                            <Link 
                                href={`/shop/${launch.id}`}
                                className="text-xs font-bold uppercase tracking-widest border-b-2 border-[#7c2d12]/20 pb-1 hover:border-[#7c2d12] transition-all"
                            >
                                Explore Launch
                            </Link>
                        </div>

                        {/* Soft Warm Glow */}
                        <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/50 rounded-full blur-2xl group-hover:bg-white/70 transition-all duration-700" />
                    </div>
                )}

                {/* SECONDARY PROMOTION BANNER */}
                {secondary && (
                    <div className="relative overflow-hidden rounded-[2rem] bg-brand-cream text-brand-primary p-6 flex flex-col justify-between group shadow-xl border border-brand-gold">
                        <div className="relative z-10">
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-gold-dark">
                                Limited Stock
                            </span>
                            <h3 className="text-xl font-serif font-bold mt-2">
                                {secondary.name}
                            </h3>
                        </div>
                        
                        <div className="relative z-10 mt-4 flex items-center justify-between">
                            <Link 
                                href={`/shop/${secondary.id}`}
                                className="text-xs font-bold uppercase tracking-widest text-brand-primary hover:text-brand-gold-dark transition-colors"
                            >
                                View Deal →
                            </Link>
                            {isApproved && (
                                <span className="font-bold text-lg text-brand-gold-dark">
                                    {formatCurrency(secondary.discountPrice || secondary.price)}
                                </span>
                            )}
                        </div>

                        {/* Subtle patterns */}
                        <div className="absolute right-0 bottom-0 w-24 h-24 bg-brand-gold-dark/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                    </div>
                )}
            </div>
        </section>
        </div>
    );
};
