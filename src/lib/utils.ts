import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// The one and only admin email for this website.
// Only this email address can access the /admin panel.
// In production: set ADMIN_EMAIL in the server's environment variables.
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "rajputfoods@gmail.com";

/**
 * Standardized check to determine if a user has administrative privileges.
 * A user is an admin if their email matches ADMIN_EMAIL or their role is "admin".
 */

// Known product image filenames present in the public folder.
const AVAILABLE_PRODUCT_IMAGES = new Set<string>([
  "Elephant Atta Medium 10kg.jpg",
  "HeavensHarvest_BasmatiRice_5kg.webp",
  "Virgin_Pink_Salt.png",
]);
export function checkIsAdmin(user?: { email?: string | null; role?: string | null } | null): boolean {
    if (!user) return false;
    return user.email === ADMIN_EMAIL || user.role === "admin";
}

const DEFAULT_LOCALE = "sv-SE";
const DEFAULT_CURRENCY = "SEK";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amountInCents: number): string {
    return (amountInCents / 100).toLocaleString(DEFAULT_LOCALE, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) + ` ${DEFAULT_CURRENCY}`;
}

// Sort products so those with an image appear first.
// Within each group, products are sorted alphabetically by name.
// This rule applies to ALL product listings across the website.
export function sortProductsImagesFirst<T extends { imageUrl?: string | null; name: string }>(
    products: T[]
): T[] {
    return [...products].sort((a, b) => {
        // Products with an image come first
        if (a.imageUrl && !b.imageUrl) return -1;
        if (!a.imageUrl && b.imageUrl) return 1;

        // Within the same group, sort alphabetically by name
        return a.name.localeCompare(b.name, DEFAULT_LOCALE);
    });
}

// Normalize product image paths entered by admins.
// 1. External URLs (http/https) are left as-is.
// 2. Local paths are prefixed with /images/products/ if they don't already have it.
// 3. Leading slashes are ensured for all local paths.

export function normalizeProductImagePath(path: string | null | undefined): string | null {
    if (!path) return null;
    const trimmed = path.trim();
    if (trimmed === "") return null;

    // Preserve external URLs and Data URIs
    if (trimmed.startsWith("http") || trimmed.startsWith("data:")) {
        return trimmed;
    }

    // Extract filename to verify existence
    const filename = trimmed.split("/").pop();
    if (filename && !AVAILABLE_PRODUCT_IMAGES.has(decodeURIComponent(filename))) {
        // Unknown or missing image – fallback to placeholder
        return null;
    }

    // Standardize local path prefix
    const standardPrefix = "/images/products/";

    // Ensure the path uses the standard prefix
    if (trimmed.startsWith(standardPrefix) || trimmed.startsWith("images/products/")) {
        return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
    }

    // For any other case (raw filename), prepend the standard prefix
    const cleanPath = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    return `${standardPrefix}${cleanPath}`;
}
