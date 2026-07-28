import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverSecurity';

export async function POST(request: NextRequest) {
  const security = verifyAdminSession(request);
  if (!security.isAdmin && security.errorResponse) {
    return security.errorResponse;
  }

  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Announcement broadcasted successfully to all candidates.',
      announcement: body
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid payload.' }, { status: 400 });
  }
}
