"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface InventoryFiltersProps {
  categories: Category[];
}

export function InventoryFilters({ categories }: InventoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const currentName = searchParams.get("name") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const navigate = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, searchParams, pathname]
  );

  const clearAll = () => {
    router.push(pathname);
  };

  const hasActiveFilters = currentName || currentSort || currentCategory;
  const activeCategoryName = categories.find(c => c.id === currentCategory)?.name;

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border shadow-sm">
      <div className="flex flex-wrap items-end gap-4">
        {/* Name Search */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Search Products
          </label>
          <input
            type="search"
            placeholder="Search by name..."
            value={currentName}
            onChange={(e) => navigate("name", e.target.value)}
            className="text-sm border rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500/20 outline-none"
          />
        </div>

        {/* Price Sort (The "Price Search" option referenced) */}
        <div className="flex flex-col gap-1 min-w-[150px]">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Price Sort
          </label>
          <select
            value={currentSort}
            onChange={(e) => navigate("sort", e.target.value)}
            className="text-sm border rounded-md px-3 py-2 focus:ring-2 focus:ring-yellow-500/20 outline-none bg-white"
          >
            <option value="">Default (A-Z)</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Category Search (Accordion) */}
        <div className="flex flex-col gap-1 min-w-[200px] relative">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Category
          </label>
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className={cn(
              "text-sm border rounded-md px-3 py-2 flex items-center justify-between bg-white text-left",
              currentCategory ? "border-yellow-500 text-yellow-700 font-medium" : "text-gray-600"
            )}
          >
            {activeCategoryName || "All Categories"}
            <span className={cn("transition-transform", isCategoryOpen ? "rotate-180" : "")}>
              ▼
            </span>
          </button>

          {isCategoryOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  navigate("category", "");
                  setIsCategoryOpen(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                  !currentCategory && "bg-yellow-50 text-yellow-700 font-bold"
                )}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    navigate("category", cat.id);
                    setIsCategoryOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors",
                    currentCategory === cat.id && "bg-yellow-50 text-yellow-700 font-bold"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Button */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-bold text-red-600 uppercase hover:underline pb-3"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
