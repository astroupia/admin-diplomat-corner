"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAdminCheck } from "@/lib/hooks/use-admin-check";
import PermissionDeniedScreen from "@/components/error/permission-denied";
import LoadingComponent from "@/components/ui/loading-component";
import { useRouter } from "next/navigation";

interface AdminProtectedProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectToPermissionDenied?: boolean;
}

/**
 * Component that wraps content that should only be accessible to admin users.
 * It checks if the current user is an admin and either:
 * 1. Shows the content if the user is an admin
 * 2. Shows a fallback component if provided
 * 3. Shows a permission denied screen
 * 4. Redirects to the permission denied page
 */
export default function AdminProtected({
  children,
  fallback,
  redirectToPermissionDenied = false,
}: AdminProtectedProps) {
  const { isAdmin, isLoading, error, revalidate } = useAdminCheck();
  const router = useRouter();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  // Handle redirect once and only once
  useEffect(() => {
    if (
      !isLoading &&
      !isAdmin &&
      redirectToPermissionDenied &&
      !hasRedirected &&
      !isInitialCheck
    ) {
      console.log("[AdminProtected] Redirecting to permission denied page");
      setHasRedirected(true);

      // Add a timestamp to bust cache
      const url = `/permission-denied?t=${Date.now()}`;
      router.push(url);
    }
  }, [
    isAdmin,
    isLoading,
    redirectToPermissionDenied,
    hasRedirected,
    router,
    isInitialCheck,
  ]);

  // Mark initial check as complete after first load
  useEffect(() => {
    if (!isLoading) {
      setIsInitialCheck(false);
    }
  }, [isLoading]);

  // While loading, show a loading component
  if (isLoading) {
    return <LoadingComponent />;
  }

  // If redirecting, show loading
  if (!isAdmin && redirectToPermissionDenied && !isInitialCheck) {
    return <LoadingComponent />;
  }

  // If there's an error or the user is not an admin
  if (!isAdmin) {
    // If a fallback is provided, show it
    if (fallback) {
      return <>{fallback}</>;
    }

    // Otherwise, show the permission denied screen
    return (
      <PermissionDeniedScreen
        title="Admin Access Required"
        message="You do not have permission to access this content. Please contact the administrator if you believe this is an error."
        onRetry={revalidate}
      />
    );
  }

  // If the user is an admin, show the protected content
  return <>{children}</>;
}
