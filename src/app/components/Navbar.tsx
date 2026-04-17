'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/lib/auth-actions';

/**
 * NAVBAR — CORE ARCHITECTURE
 * Layout Strategy: sticky top-0 z-50 — pushes content down, no overlap.
 * Structure:
 *   ├── TopBar   (utility: delivery info, logout, wishlist)
 *   ├── MainBar  (core: logo [secondary] + search [dominant] + admin link)
 *   └── CategoryBar (navigation: category dropdown + quick links)
 */

interface Category {
    name: string;
    href: string;
}

const CATEGORIES: Category[] = [
    { name: 'Spices & Seasonings', href: '/shop/spices' },
    { name: 'Heritage Grains',     href: '/shop/grains' },
    { name: 'Traditional Dairy',   href: '/shop/dairy' },
    { name: 'Pickles & Preserves', href: '/shop/pickles' },
];

const Navbar = () => {
    const pathname = usePathname();
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);

    // Do not render on the landing page — hero branding takes over
    if (pathname === '/') return null;

    return (
        <header className="sticky top-0 z-50 w-full flex flex-col shadow-md">

            {/* ── 1. TOP BAR (Utility Layer) ───────────────────────────────── */}
            {/* Height: 32px mobile → 40px desktop. Low visual weight, light gold. */}
            <div className="h-8 md:h-10 bg-linear-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark border-b border-brand-gold-dark/40 px-6 md:px-8 flex items-center justify-between">

                {/* Left — Delivery / location info */}
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-stone-900/70 font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                    Deliveries across Motala and surrounding areas
                </div>

                {/* Right — Logout + Wishlist quick access */}
                <div className="flex items-center gap-5">

                    {/* Logout */}
                    <form action={logout}>
                        <button
                            type="submit"
                            className="text-[10px] uppercase tracking-[0.18em] font-bold text-stone-800/70 hover:text-red-800 transition-colors"
                        >
                            Log out
                        </button>
                    </form>

                    {/* ❤️ Wishlist — quick access in TopBar */}
                    <Link
                        href="/wishlist"
                        title="My Wishlist"
                        className="text-brand-primary/60 hover:text-brand-gold-dark transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* ── 2. MAIN BAR (Core Interaction) ───────────────────────────── */}
            {/* Gold background. Logo secondary to search. */}
            <div className="bg-linear-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark px-6 md:px-8 py-3 md:py-4 flex items-center justify-between gap-6 md:gap-10">

                {/* Logo — recognisable but secondary. Dark text + deep red accent on gold. */}
                <Link href="/shop" className="shrink-0" aria-label="Rajput Foods — home">
                    <span className="text-lg md:text-xl font-black tracking-tighter text-stone-900 italic uppercase">
                        Rajput{' '}
                        <span className="text-red-900 font-light">Foods</span>
                    </span>
                </Link>

                {/* Search — dominant, centred, white background for contrast on gold */}
                <div className="flex-1 max-w-2xl relative group">
                    <input
                        id="navbar-search"
                        type="search"
                        placeholder="Search Heritage Flavours..."
                        aria-label="Search products"
                        className="w-full bg-white border border-brand-border/60 rounded-lg py-2 md:py-2.5 pl-11 pr-4 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-gold-dark/40 focus:border-brand-gold-dark transition-all"
                    />
                    <svg
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold-dark/70 group-focus-within:text-brand-gold-dark transition-colors"
                        xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                    </svg>
                </div>

                {/* Right actions — Admin link, styled dark on gold */}
                <div className="flex items-center gap-5 shrink-0">
                    <Link
                        href="/admin"
                        className={`text-[11px] font-black uppercase tracking-widest transition-colors hidden md:block ${
                            pathname.startsWith('/admin')
                                ? 'text-red-900 border-b-2 border-red-900 pb-0.5'
                                : 'text-stone-700 hover:text-stone-900'
                        }`}
                    >
                        Admin
                    </Link>
                </div>
            </div>

            {/* ── 3. CATEGORY BAR (Navigation) ─────────────────────────────── */}
            {/* Slightly lighter gold strip. Fixed height. */}
            <div className="bg-linear-to-r from-brand-gold-dark/80 via-brand-gold/60 to-brand-gold-dark/80 border-b border-brand-gold-dark/30 px-6 md:px-8 flex items-center h-11">

                {/* Category dropdown */}
                <div className="relative h-full flex items-center">
                    <button
                        id="category-menu-button"
                        onMouseEnter={() => setIsCategoryOpen(true)}
                        onMouseLeave={() => setIsCategoryOpen(false)}
                        aria-haspopup="true"
                        aria-expanded={isCategoryOpen}
                        className="h-full flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-tight hover:text-stone-900 px-3 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" x2="20" y1="6"  y2="6"  />
                            <line x1="4" x2="20" y1="12" y2="12" />
                            <line x1="4" x2="20" y1="18" y2="18" />
                        </svg>
                        Explore Categories
                    </button>

                    {isCategoryOpen && (
                        <div
                            role="menu"
                            onMouseEnter={() => setIsCategoryOpen(true)}
                            onMouseLeave={() => setIsCategoryOpen(false)}
                            className="absolute top-full left-0 w-64 bg-white border border-brand-border shadow-xl z-50 rounded-b-xl overflow-hidden"
                        >
                            {CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.href}
                                    href={cat.href}
                                    role="menuitem"
                                    className="block px-6 py-3.5 text-xs font-semibold text-stone-700 border-b border-brand-border/30 last:border-0 hover:bg-brand-gold hover:text-stone-900 transition-colors uppercase tracking-wide"
                                >
                                    {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Secondary nav links */}
                <div className="flex gap-6 ml-6">
                    <Link
                        href="/shop/new"
                        className="text-[11px] text-stone-600 hover:text-stone-900 uppercase font-bold tracking-widest transition-colors"
                    >
                        New Arrivals
                    </Link>
                    <Link
                        href="/shop/offers"
                        className="text-[11px] text-red-800 hover:text-red-900 uppercase font-bold tracking-widest transition-colors flex items-center gap-1"
                    >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-700" aria-hidden="true" />
                        Special Offers
                    </Link>
                    <Link
                        href="/shop/heritage"
                        className="text-[11px] text-stone-600 hover:text-stone-900 uppercase font-bold tracking-widest transition-colors"
                    >
                        Our Heritage
                    </Link>
                    <Link
                        href="/about"
                        className="text-[11px] text-stone-600 hover:text-stone-900 uppercase font-bold tracking-widest transition-colors"
                    >
                        About Us
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
