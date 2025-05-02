// Override Next.js route parameter types to avoid build errors
import { NextRequest, NextResponse } from "next/server";

// Fix for dynamic route parameters
declare module "next/dist/server/future/route-modules/app-route/module" {
  interface RouteModule {
    POST?: (
      request: NextRequest,
      context: { params: any }
    ) => Promise<NextResponse> | NextResponse;
    GET?: (
      request: NextRequest,
      context: { params: any }
    ) => Promise<NextResponse> | NextResponse;
    PUT?: (
      request: NextRequest,
      context: { params: any }
    ) => Promise<NextResponse> | NextResponse;
    DELETE?: (
      request: NextRequest,
      context: { params: any }
    ) => Promise<NextResponse> | NextResponse;
    PATCH?: (
      request: NextRequest,
      context: { params: any }
    ) => Promise<NextResponse> | NextResponse;
  }
}
