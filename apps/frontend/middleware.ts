import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware for protecting routes that require authentication.
 * 
 * Protected routes:
 * - /dashboard/*
 * - Any route that requires authentication
 * 
 * Public routes:
 * - /
 * - /auth/callback
 * - /api/*
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/auth/callback'];
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/api/');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for authentication token in cookies or headers
  // For now, we'll let the client-side handle auth checks
  // In production, you might want to verify JWT here
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // If no token and trying to access protected route, redirect to home
  if (!token && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
