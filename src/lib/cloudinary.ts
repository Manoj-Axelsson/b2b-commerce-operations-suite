/**
 * Cloudinary Upload Configuration & Helpers
 *
 * This module handles image uploads to Cloudinary with unsigned uploads (free tier compatible).
 * For production, properly handle CLOUDINARY_API_KEY in environment variables.
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name (public)
 */

export function getCloudinaryConfig() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME environment variable is not set. " +
      "Please set up your Cloudinary account and add this to .env.local"
    );
  }
  return { cloudName };
}

/**
 * Formats a Cloudinary delivery URL with optional transformations.
 * Example: https://res.cloudinary.com/{cloudName}/image/upload/c_fill,w_500,h_500/v1234567890/{public_id}
 *
 * Useful for generating optimized image URLs for different contexts (thumbnails, gallery, etc.)
 */
export function buildCloudinaryUrl(publicId: string, options?: {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "scale" | "crop";
  quality?: "auto" | number;
  format?: "webp" | "jpg" | "png" | "auto";
}) {
  const { cloudName } = getCloudinaryConfig();
  const transformations: string[] = [];

  if (options?.crop) transformations.push(`c_${options.crop}`);
  if (options?.width) transformations.push(`w_${options.width}`);
  if (options?.height) transformations.push(`h_${options.height}`);
  if (options?.quality) {
    const quality = options.quality === "auto" ? "auto" : options.quality;
    transformations.push(`q_${quality}`);
  }
  if (options?.format && options.format !== "auto") {
    transformations.push(`f_${options.format}`);
  }

  const transformPath = transformations.length > 0 ? transformations.join(",") + "/" : "";
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformPath}v1/${publicId}`;
}

/**
 * Validates that a URL is from Cloudinary.
 */
export function isCloudinaryUrl(url: string): boolean {
  try {
    const { cloudName } = getCloudinaryConfig();
    return url.includes(`res.cloudinary.com/${cloudName}`);
  } catch {
    return false;
  }
}

