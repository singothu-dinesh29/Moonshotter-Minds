import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-Side Admin Session & Role Verification Utility
 * Never trusts client-side role claims. Validates HTTP cookie & server-side secrets.
 */
export function verifyAdminSession(request: NextRequest): { isAdmin: boolean; errorResponse?: NextResponse } {
  const authRole = request.cookies.get('symphosium_role')?.value;

  // Check if role cookie exists and strictly equals 'ADMIN'
  if (!authRole || authRole !== 'ADMIN') {
    return {
      isAdmin: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: '403 Forbidden: Admin authentication and role session required to perform this sensitive operation.'
        },
        { status: 403 }
      )
    };
  }

  return { isAdmin: true };
}
