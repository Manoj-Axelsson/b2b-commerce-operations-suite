import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
