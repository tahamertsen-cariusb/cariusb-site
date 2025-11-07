import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for protected routes (optional)
 * 
 * Note: Supabase auth is client-side (localStorage), so middleware
 * cannot check auth state directly. Protected routes are handled by
 * DashboardGuard component on the client side.
 * 
 * This middleware can be extended later if server-side auth checks
 * are needed (e.g., with @supabase/ssr package).
 */
export async function middleware(request: NextRequest) {
  // For now, just pass through
  // Protected routes are handled by DashboardGuard component
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};

