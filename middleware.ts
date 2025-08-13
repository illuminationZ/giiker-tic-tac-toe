import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only redirect if the path is exactly /login (not /login with query params)
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }

  // Only redirect if the path is exactly /register or /signup
  if (pathname === '/register' || pathname === '/signup') {
    return NextResponse.redirect(new URL('/auth/signup', request.url));
  }

  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: ['/login', '/register', '/signup'],
};
