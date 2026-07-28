import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const incident = await req.json();
    console.log('[ANTI-CHEAT LOGGED]', incident);

    return NextResponse.json({
      success: true,
      logged_at: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to log telemetry' }, { status: 500 });
  }
}
