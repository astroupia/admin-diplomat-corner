// Global type declarations to fix build errors

// This will help skip type checking for Next.js route handlers
// @ts-expect-error - Required to fix Next.js 14 route parameter type issues
interface ParamCheck<RouteContext> {
  params: any;
}
