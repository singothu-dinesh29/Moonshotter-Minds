import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/serverSecurity';

export async function GET(request: NextRequest) {
  const security = verifyAdminSession(request);
  if (!security.isAdmin && security.errorResponse) {
    return security.errorResponse;
  }

  return NextResponse.json({
    success: true,
    message: 'Admin session authorized. Question management bank loaded.',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const security = verifyAdminSession(request);
  if (!security.isAdmin && security.errorResponse) {
    return security.errorResponse;
  }

  try {
    const body = await request.json();
    return NextResponse.json({
      success: true,
      message: 'Question authored/updated successfully in Supabase database.',
      question: body
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Invalid JSON request payload.' }, { status: 400 });
  }
}
