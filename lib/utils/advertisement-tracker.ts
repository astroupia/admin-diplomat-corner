/**
 * Utility functions for tracking advertisement views and clicks
 */

/**
 * Track an advertisement view
 *
 * @param adId The ID of the advertisement
 * @returns A promise that resolves to the updated view count or null if the request failed
 */
export async function trackView(adId: string): Promise<number | null> {
  try {
    const response = await fetch(`/api/advertisements/${adId}/view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to track view:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.viewCount || null;
  } catch (error) {
    console.error("Error tracking advertisement view:", error);
    return null;
  }
}

/**
 * Track an advertisement click
 *
 * @param adId The ID of the advertisement
 * @returns A promise that resolves to the updated click count or null if the request failed
 */
export async function trackClick(adId: string): Promise<number | null> {
  try {
    const response = await fetch(`/api/advertisements/${adId}/click`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to track click:", await response.text());
      return null;
    }

    const data = await response.json();
    return data.clickCount || null;
  } catch (error) {
    console.error("Error tracking advertisement click:", error);
    return null;
  }
}

/**
 * A React hook to track an advertisement view when a component mounts
 *
 * @example
 * // In a React component
 * import { useAdvertisementView } from '@/lib/utils/advertisement-tracker';
 *
 * function AdvertisementComponent({ adId }) {
 *   useAdvertisementView(adId);
 *   return <div>Advertisement Content</div>;
 * }
 */
export function useAdvertisementView(adId: string): void {
  if (typeof window !== "undefined") {
    // Only run this on the client side
    const hasViewed = sessionStorage.getItem(`ad_view_${adId}`);

    if (!hasViewed) {
      // Track the view and store in session storage to prevent duplicate counts
      trackView(adId).then(() => {
        sessionStorage.setItem(`ad_view_${adId}`, "true");
      });
    }
  }
}

/**
 * Create a click handler that tracks an advertisement click before navigation
 *
 * @param adId The ID of the advertisement
 * @param url The URL to navigate to after tracking
 * @returns A function to use as an onClick handler
 *
 * @example
 * // In a React component
 * import { createClickHandler } from '@/lib/utils/advertisement-tracker';
 *
 * function AdButton({ adId, url }) {
 *   const handleClick = createClickHandler(adId, url);
 *   return <button onClick={handleClick}>Click here</button>;
 * }
 */
export function createClickHandler(
  adId: string,
  url: string
): (e: React.MouseEvent) => void {
  return (e: React.MouseEvent) => {
    e.preventDefault();

    // Track the click
    trackClick(adId).then(() => {
      // After tracking, navigate to the URL
      window.location.href = url;
    });
  };
}
