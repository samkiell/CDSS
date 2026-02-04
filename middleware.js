import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

const { auth } = NextAuth(authConfig);

export const middleware = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // Logging for verification
  if (isLoggedIn) {
    const cookieHeader = req.headers.get('cookie') || '';
    if (cookieHeader.length > 2000) {
      console.warn(
        `[Middleware] LARGE COOKIE DETECTED for ${nextUrl.pathname}: ${cookieHeader.length} bytes`
      );
    }
  }

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = ['/', '/login', '/register', '/verify', '/admin'].includes(
    nextUrl.pathname
  );
  const isAuthRoute = ['/login', '/register', '/admin'].includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      const role = req.auth?.user?.role?.toUpperCase();
      console.log(
        `Middleware: Authenticated user with role ${role} accessing auth route ${nextUrl.pathname}. Redirecting...`
      );

      if (role === 'ADMIN')
        return Response.redirect(new URL('/admin/dashboard', nextUrl));
      if (role === 'CLINICIAN')
        return Response.redirect(new URL('/clinician/dashboard', nextUrl));

      return Response.redirect(new URL('/patient/dashboard', nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    const callbackUrl = nextUrl.pathname;
    if (nextUrl.pathname.startsWith('/admin')) {
      return Response.redirect(new URL(`/admin?callbackUrl=${callbackUrl}`, nextUrl));
    }
    return Response.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  // Role-based protection
  if (isLoggedIn) {
    const role = req.auth.user.role;

    if (nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
      return Response.redirect(new URL('/login', nextUrl));
    }

    if (
      nextUrl.pathname.startsWith('/clinician') &&
      role !== 'CLINICIAN' &&
      role !== 'ADMIN'
    ) {
      return Response.redirect(new URL('/login', nextUrl));
    }

    if (
      nextUrl.pathname.startsWith('/patient') &&
      role !== 'PATIENT' &&
      role !== 'ADMIN'
    ) {
      return Response.redirect(new URL('/login', nextUrl));
    }
  }

  return null;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
