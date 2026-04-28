"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

interface FilterOption {
    value: string;
    label: string;
}

interface ShopFiltersProps {
    brands: string[];
    weights: string[];         // e.g. ["5-kg", "10-kg", "25-kg"]
    categoryName?: string;     // display name of the active category
}

// Builds a URL query string from the current params plus an override.
// Removes the param entirely when value is empty.
function buildUrl(
    params: URLSearchParams,
    key: string,
    value: string,
    pathname: string
): string {
    const next = new URLSearchParams(params.toString());

    if (value) {
        next.set(key, value);
    } else {
        next.delete(key);
    }

    // Reset to page 1 whenever a filter changes (future-proof)
    next.delete("page");

    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
}

export function ShopFilters({ brands, weights, categoryName }: ShopFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentName    = searchParams.get("name") ?? "";
    const currentSort    = searchParams.get("sort") ?? "";
    const currentBrand   = searchParams.get("brand") ?? "";
    const currentWeight  = searchParams.get("weight") ?? "";
    const currentOffers  = searchParams.get("offers") === "true";

    // Navigate to a new URL when a filter changes
    const navigate = useCallback(
        (key: string, value: string) => {
            const url = buildUrl(searchParams, key, value, pathname);
            router.push(url);
        },
        [router, searchParams, pathname]
    );

    const clearAll = () => {
        // Keep only the category param when clearing
        const categoryId = searchParams.get("category");
        const next = new URLSearchParams();
        if (categoryId) next.set("category", categoryId);
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    };

    const hasActiveFilters = currentName || currentSort || currentBrand || currentWeight || currentOffers;

    const sortOptions: FilterOption[] = [
        { value: "",           label: "Default (A–Z)" },
        { value: "price_asc",  label: "Price: Low → High" },
        { value: "price_desc", label: "Price: High → Low" },
    ];

    return (
        <div className="w-full bg-white border border-brand-border rounded-xl shadow-sm px-4 py-4 mb-8">
            <div className="flex flex-wrap items-end gap-3">

                {/* Category heading (read-only, set by URL) */}
                {categoryName && (
                    <div className="flex flex-col gap-1 min-w-[120px]">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Category
                        </span>
                        <span className="text-sm font-medium text-brand-primary capitalize">
                            {categoryName}
                        </span>
                    </div>
                )}

                {/* Name search */}
                <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <label
                        htmlFor="filter-name"
                        className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                    >
                        Product Name
                    </label>
                    <input
                        id="filter-name"
                        type="search"
                        placeholder="Search…"
                        value={currentName}
                        onChange={(e) => navigate("name", e.target.value)}
                        className="text-sm border border-brand-border rounded-md px-3 py-1.5 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold/40 placeholder:text-muted-foreground"
                    />
                </div>

                {/* Price sort */}
                <div className="flex flex-col gap-1 min-w-[160px]">
                    <label
                        htmlFor="filter-sort"
                        className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                    >
                        Price
                    </label>
                    <select
                        id="filter-sort"
                        value={currentSort}
                        onChange={(e) => navigate("sort", e.target.value)}
                        className="text-sm border border-brand-border rounded-md px-3 py-1.5 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                    >
                        {sortOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Brand filter */}
                {brands.length > 0 && (
                    <div className="flex flex-col gap-1 min-w-[140px]">
                        <label
                            htmlFor="filter-brand"
                            className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                        >
                            Brand
                        </label>
                        <select
                            id="filter-brand"
                            value={currentBrand}
                            onChange={(e) => navigate("brand", e.target.value)}
                            className="text-sm border border-brand-border rounded-md px-3 py-1.5 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                        >
                            <option value="">All Brands</option>
                            {brands.map((b) => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Weight filter */}
                {weights.length > 0 && (
                    <div className="flex flex-col gap-1 min-w-[140px]">
                        <label
                            htmlFor="filter-weight"
                            className="text-xs font-bold text-muted-foreground uppercase tracking-widest"
                        >
                            Weight
                        </label>
                        <select
                            id="filter-weight"
                            value={currentWeight}
                            onChange={(e) => navigate("weight", e.target.value)}
                            className="text-sm border border-brand-border rounded-md px-3 py-1.5 bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
                        >
                            <option value="">All Weights</option>
                            {weights.map((w) => (
                                <option key={w} value={w}>
                                    {w.replace("-", " ")}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Offers toggle */}
                <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Offers
                    </span>
                    <label
                        htmlFor="filter-offers"
                        className="flex items-center gap-2 cursor-pointer select-none text-sm text-brand-primary"
                    >
                        <input
                            id="filter-offers"
                            type="checkbox"
                            checked={currentOffers}
                            onChange={(e) => navigate("offers", e.target.checked ? "true" : "")}
                            className="w-4 h-4 rounded border-brand-border text-brand-gold focus:ring-brand-gold/40 cursor-pointer"
                        />
                        On sale only
                    </label>
                </div>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearAll}
                        className="text-xs font-bold text-brand-gold uppercase tracking-widest hover:underline self-end pb-2"
                    >
                        Clear filters
                    </button>
                )}
            </div>
        </div>
    );
}
