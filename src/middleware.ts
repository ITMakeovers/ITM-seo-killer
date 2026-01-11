import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSiteConfig } from '@/lib/config';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    try {
      const config = getSiteConfig();
      
      if (!config.admin?.enabled) {
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Check if PIN hash is configured - if yes, require authentication
      if (config.admin?.pinHash) {
        const authCookie = request.cookies.get('admin-auth');
        
        // If no auth cookie, redirect to admin (which will show login)
        if (!authCookie || authCookie.value !== 'true') {
          // Allow access to the admin page itself (it will show login form)
          if (request.nextUrl.pathname === '/admin') {
            return NextResponse.next();
          }
          // Redirect other admin paths to main admin page
          return NextResponse.redirect(new URL('/admin', request.url));
        }
      }
    } catch (error) {
      console.error('Error checking admin config:', error);
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};

