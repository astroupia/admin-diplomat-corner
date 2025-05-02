import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the routes that should be accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhook(.*)",
]);

// This middleware protects all routes except the public ones
export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If the user is already signed in and trying to access the sign-in page,
  // redirect them to the home page
  if (userId && req.nextUrl.pathname.startsWith("/sign-in")) {
    const homeUrl = new URL("/", req.url);
    return NextResponse.redirect(homeUrl);
  }

  // If the user is not authenticated and trying to access a protected route,
  // redirect them to the sign-in page
  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }
});

// Configure middleware to match all routes except static files and internal Next.js routes
export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
