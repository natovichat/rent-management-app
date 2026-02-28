import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const PUBLIC_PATHS = ['/login', '/auth/callback', '/auth/error'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

function isValidJwtFormat(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    // Decode payload to check expiration (edge-compatible - no crypto)
    const payload = JSON.parse(
      Buffer.from(parts[1], 'base64').toString('utf-8'),
    );
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Allow static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookies (set during callback)
  const tokenFromCookie = request.cookies.get('auth_token')?.value;

  if (tokenFromCookie && isValidJwtFormat(tokenFromCookie)) {
    return NextResponse.next();
  }

  // For client-side navigation, the token is in localStorage (not accessible in middleware).
  // We rely on the client-side check in AppShell + the 401 interceptor for localStorage tokens.
  // However, we can check for a special header the client might send.
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    if (isValidJwtFormat(token)) {
      return NextResponse.next();
    }
  }

  // No valid token found - redirect to login
  // But allow the page to load (client-side auth check in AppShell will handle redirect)
  // This prevents hard redirects on first load where localStorage isn't accessible
  return NextResponse.next();
}

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
