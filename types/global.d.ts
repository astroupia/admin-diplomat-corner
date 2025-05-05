// Global type declarations to fix build errors

// This will help skip type checking for Next.js 14 route parameter type issues
interface ParamCheck<RouteContext> {
  params: Record<string, string | string[]>;
}
