import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define the role interface
interface PublicMetadata {
  role?: string;
}

// This function will handle admin route protection
async function handleAdminRoute(req: NextRequest) {
  try {
    // Get the session from the cookie
    const sessionId = req.cookies.get("__session")?.value;

    if (!sessionId) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Admin route protection error:", error);
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
}

// Export middleware with custom error handling
export default clerkMiddleware(async (auth, req) => {
  try {
    // Check if the request is for an admin route
    if (req.nextUrl.pathname.startsWith("/admin-shield")) {
      // Get the auth state - will resolve to auth.userId
      const { userId } = await auth();

      if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
      }

      // If authenticated but accessing admin landing
      if (req.nextUrl.pathname === "/admin-shield") {
        return NextResponse.redirect(
          new URL("/admin-shield/admin/dashboard", req.url)
        );
      }
    }

    // For all other routes, proceed normally
    return NextResponse.next();
  } catch (error) {
    console.error("Clerk middleware error:", error);

    // Handle JWT verification errors gracefully
    if (req.nextUrl.pathname.startsWith("/admin-shield")) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // For other pages, just continue to the page which will handle auth state client-side
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!_next|static|.*\\..*|api|trpc).*)", "/", "/(api|trpc)(.*)"],
};
