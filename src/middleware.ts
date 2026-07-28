import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authRole = request.cookies.get('symphosium_role')?.value;

  // Protect Admin API routes (/api/admin/*) -> Return 403 Forbidden for unauthorized requests
  if (pathname.startsWith('/api/admin')) {
    if (authRole !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: '403 Forbidden: Admin authentication and role session required to access this API route.'
        },
        { status: 403 }
      );
    }
  }

  // Protect Admin UI Pages (/admin/*) -> Redirect to /login
  if (pathname.startsWith('/admin')) {
    if (authRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect Student Routes (/dashboard/* or /student/*)
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/student')) {
    if (!authRole) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/dashboard/:path*', '/student/:path*'],
};
