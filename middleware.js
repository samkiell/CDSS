import { auth } from './auth';

export const middleware = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isPublicRoute = ['/', '/login', '/register', '/verify'].includes(
    nextUrl.pathname
  );
  const isAuthRoute = ['/login', '/register'].includes(nextUrl.pathname);

  if (isApiAuthRoute) {
    return null;
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      // Redirect logged in users away from auth pages
      const role = req.auth.user.role;
      if (role === 'ADMIN')
        return Response.redirect(new URL('/admin/dashboard', nextUrl));
      if (role === 'CLINICIAN')
        return Response.redirect(new URL('/clinician/dashboard', nextUrl));
      return Response.redirect(new URL('/patient/dashboard', nextUrl));
    }
    return null;
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL('/login', nextUrl));
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
