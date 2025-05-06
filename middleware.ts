import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the routes that should be accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
  "/permission-denied(.*)",
]);

// Define admin-only routes
const isAdminRoute = createRouteMatcher([
  "/", // Dashboard home
  "/products(.*)",
  "/payments(.*)",
  "/statistics(.*)",
  "/advertisements(.*)",
  "/messages(.*)",
  // Add other admin routes as needed
]);

// This middleware protects all routes except the public ones
export default clerkMiddleware(async (auth, req) => {
  try {
    const { userId } = await auth();
    const pathname = req.nextUrl.pathname;

    // Log for debugging
    console.log(
      `Middleware processing path: ${pathname}, userId: ${userId || "none"}`
    );

    // If the user is already signed in and trying to access the sign-in page,
    // redirect them to the home page
    if (userId && pathname.startsWith("/sign-in")) {
      const homeUrl = new URL("/", req.url);
      console.log(`Redirecting signed-in user from sign-in to home`);
      return NextResponse.redirect(homeUrl);
    }

    // If the user is not authenticated and trying to access a protected route,
    // redirect them to the sign-in page
    if (!isPublicRoute(req) && !userId) {
      console.log(`Unauthenticated access to protected route: ${pathname}`);
      const signInUrl = new URL("/sign-in", req.url);
      signInUrl.searchParams.set("redirect_url", req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Check if the user is trying to access an admin route
    // In middleware, we'll only check if user is authenticated, not if they're admin
    // The actual admin check will be done client-side by the AdminProtected component
    if (userId && isAdminRoute(req)) {
      // Instead of checking admin status here (which causes Edge runtime issues),
      // we'll let the client-side AdminProtected component handle admin checks
      console.log(`User ${userId} accessing admin route: ${pathname}`);
    }

    // Continue with the request - without setting cache control headers
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // For API routes, return JSON error
    if (req.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json(
        {
          error: "Middleware error",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
    // For page routes, continue with the request
    return NextResponse.next();
  }
});

// Configure middleware to match all routes except static files and internal Next.js routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
