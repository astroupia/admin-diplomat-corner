"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface UserAvatarProps {
  imageUrl?: string | null;
  alt?: string;
  size?: number;
  className?: string;
  fallbackInitials?: string;
}

export default function UserAvatar({
  imageUrl,
  alt = "User",
  size = 48,
  className = "",
  fallbackInitials,
}: UserAvatarProps) {
  const [src, setSrc] = useState<string>("/images/default-avatar.png");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [useFallbackImage, setUseFallbackImage] = useState(false);
  const [useFallbackInitials, setUseFallbackInitials] = useState(false);

  // Get initials from alt text
  const getInitials = () => {
    if (fallbackInitials) return fallbackInitials.substring(0, 2).toUpperCase();
    if (!alt || alt === "User") return "U";

    return alt
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Set the image source once when component mounts
  useEffect(() => {
    if (imageUrl) {
      setSrc(imageUrl);
      setError(false);
      setUseFallbackImage(false);
      setUseFallbackInitials(false);
    } else {
      setUseFallbackImage(true);
    }
    setIsLoading(false);
  }, [imageUrl]);

  // Handle image error by showing default avatar
  const handleImageError = () => {
    console.log("Image failed to load, using fallback");
    setUseFallbackImage(true);
  };

  // Handle fallback image error by using initials
  const handleFallbackError = () => {
    console.log("Fallback image failed too, using initials");
    setUseFallbackInitials(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className={`relative flex items-center justify-center animate-pulse bg-gray-700 rounded-full overflow-hidden ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  // Initials fallback (last resort)
  if (useFallbackInitials) {
    return (
      <div
        className={`relative flex items-center justify-center bg-amber-800 text-white font-bold rounded-full overflow-hidden ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${Math.max(size / 2.5, 12)}px`,
        }}
      >
        {getInitials()}
      </div>
    );
  }

  // Default image fallback
  if (useFallbackImage) {
    return (
      <div className="relative">
        <Image
          src="/images/default-avatar.svg"
          alt={alt}
          width={size}
          height={size}
          className={`${className}`}
          onError={handleFallbackError}
          priority
        />
      </div>
    );
  }

  // Primary image
  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={`${className}`}
        onError={handleImageError}
        priority
      />
    </div>
  );
}
