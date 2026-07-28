import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverSecurity';

export async function GET(request: NextRequest) {
  const security = verifyAdminSession(request);
  if (!security.isAdmin && security.errorResponse) {
    return security.errorResponse;
  }

  return NextResponse.json({
    success: true,
    message: 'Admin session authorized. Reports dataset ready.',
    timestamp: new Date().toISOString()
  });
}
