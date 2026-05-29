import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest, verifySession } from '@/lib/auth';

const PUBLIC_PATHS = ['/login', '/api/auth/login', '/profil'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static assets
  if (pathname.startsWith('/_next') || pathname.startsWith('/favicon') || pathname === '/') {
    return NextResponse.next();
  }

  const token = getSessionFromRequest(request);
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifySession(token);
  if (!session) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('session', '', { maxAge: 0 });
    return response;
  }

  // Admin routes require admin role
  if (pathname.startsWith('/admin') && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Inject session info as headers for route handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', session.userId);
  requestHeaders.set('x-tenant-id', session.tenantId || '');
  requestHeaders.set('x-role', session.role);
  requestHeaders.set('x-email', session.email);
  requestHeaders.set('x-first-name', session.firstName);
  requestHeaders.set('x-last-name', session.lastName);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
