import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function decodeJwtPayload(token: string): { role?: string; exp?: number; userId?: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('perpusjal_session')?.value;

  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/tulis');

  // 1. Unauthenticated users trying to access protected routes
  if (isProtectedRoute && !sessionToken) {
    const loginUrl = new URL('/masuk', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Validate token structure & expiration if token exists
  if (sessionToken && isProtectedRoute) {
    const payload = decodeJwtPayload(sessionToken);

    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      const loginUrl = new URL('/masuk', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete('perpusjal_session');
      return res;
    }

    // 3. Strict Admin Route Guarding
    if (pathname.startsWith('/admin')) {
      const role = payload.role;

      // Only KURATOR and ADMIN can access admin area
      if (role !== 'ADMIN' && role !== 'KURATOR') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      // /admin/pengguna is strictly ADMIN only
      if (pathname.startsWith('/admin/pengguna') && role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/tulis/:path*'],
};
