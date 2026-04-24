import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// The one and only admin email for this website.
// Only this email address can access the /admin panel.
// In production: set ADMIN_EMAIL in the server's environment variables.
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "rajputfoods@gmail.com";

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
