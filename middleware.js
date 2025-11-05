import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  console.log('Middleware - Path:', pathname, 'Has token:', !!token);

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];
  if (publicRoutes.includes(pathname)) {
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('Redirecting authenticated user to:', decoded.role);
        // Redirect to appropriate dashboard
        return NextResponse.redirect(new URL(`/${decoded.role}`, request.url));
      } catch (error) {
        // Token invalid, allow access to public route
        console.log('Token invalid, allowing public access');
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  // Protected routes - require authentication
  if (!token) {
    console.log('No token, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('User role:', decoded.role, 'Path:', pathname);

    // Role-based access control
    if (pathname.startsWith('/admin') && decoded.role !== 'admin') {
      console.log('Access denied for non-admin to admin route');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    if (pathname.startsWith('/doctor') && decoded.role !== 'doctor') {
      console.log('Access denied for non-doctor to doctor route');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    if (pathname.startsWith('/patient') && decoded.role !== 'patient') {
      console.log('Access denied for non-patient to patient route');
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }

    // Allow access to the route
    return NextResponse.next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    // Clear invalid token and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/patient/:path*',
    '/login',
    '/register'
  ]
};