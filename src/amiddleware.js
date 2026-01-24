// /**
//  * Next.js Middleware
//  * Handles route protection and authentication checks
//  */

// import { NextResponse } from 'next/server';

// // Routes that require authentication
// const protectedRoutes = [
//   '/dashboard',
//   '/assessment',
//   '/history',
//   '/chat',
//   '/patients',
//   '/reviews',
// ];

// // Routes accessible only to guests (redirect if authenticated)
// const guestRoutes = ['/login', '/register'];

// // Role-specific route prefixes
// // Role-specific route prefixes
// // const roleRoutes = {
// //   patient: ['/(patient)', '/dashboard', '/assessment', '/history', '/chat'],
// //   clinician: ['/(clinician)', '/clinician', '/patients', '/reviews'],
// //   admin: ['/admin'],
// // };

// export function middleware(request) {
//   const { pathname } = request.nextUrl;

//   // Get token from cookies (will be set after login)
//   const token = request.cookies.get('cdss-token')?.value;

//   // Skip middleware for API routes, static files, and Next.js internals
//   if (
//     pathname.startsWith('/api') ||
//     pathname.startsWith('/_next') ||
//     pathname.startsWith('/static') ||
//     pathname.includes('.') // Files like favicon.ico
//   ) {
//     return NextResponse.next();
//   }

//   // Check if route requires authentication
//   const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

//   // Check if route is for guests only
//   const isGuestRoute = guestRoutes.some((route) => pathname.startsWith(route));

//   // Redirect unauthenticated users from protected routes
//   if (isProtectedRoute && !token) {
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('redirect', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Redirect authenticated users from guest routes
//   if (isGuestRoute && token) {
//     return NextResponse.redirect(new URL('/dashboard', request.url));
//   }

//   // TODO: Add role-based route protection
//   // This would decode the JWT and check the user's role against allowed routes

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     '/((?!api|_next/static|_next/image|favicon.ico).*)',
//   ],
// };
