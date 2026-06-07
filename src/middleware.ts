import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Array of routes that require authentication
const protectedRoutes = [
  '/overview',
  '/incidents',
  '/logs',
  '/integrations',
  '/analytics',
  '/settings',
  '/notifications',
  '/dashboard' // Legacy catch-all if they hit old URLs
];

// Array of routes that are for authentication only
const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password'
];

const JWT_SECRET = process.env.JWT_SECRET || 'catchme-super-secret-key-12345';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const token = request.cookies.get('catchme_session')?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await jwtVerify(token, secretKey);
      isAuthenticated = true;
    } catch (err) {
      isAuthenticated = false;
    }
  }

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if accessing protected route without auth
    const url = new URL('/auth/login', request.url);
    // Optionally preserve the attempted URL
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect to overview if already logged in and trying to access auth pages
    return NextResponse.redirect(new URL('/overview', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
