import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-replace-in-production-min-32-chars';
const secretKey = new TextEncoder().encode(JWT_SECRET);

interface DecodedSession {
  role?: string;
  exp?: number;
  userId?: string;
  sessionId?: string;
}

async function verifyJwtToken(token: string): Promise<DecodedSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return payload as DecodedSession;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
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

  // 2. Validate token structure, signature & expiration if token exists
  if (sessionToken && isProtectedRoute) {
    const payload = await verifyJwtToken(sessionToken);

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
