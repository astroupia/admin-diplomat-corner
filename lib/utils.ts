import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gets the primary image URL for a car or house, prioritizing imageUrls array if it exists
 */
export function getPrimaryImageUrl(item: {
  imageUrl?: string;
  imageUrls?: string[];
}): string | undefined {
  if (item.imageUrls && item.imageUrls.length > 0) {
    return item.imageUrls[0];
  }
  return item.imageUrl;
}
