import { NextResponse } from 'next/server';
import { MOCK_INITIAL_LEADERBOARD } from '@/lib/supabase';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: MOCK_INITIAL_LEADERBOARD
  });
}
