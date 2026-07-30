import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_score', { ascending: false });

    if (error || !data) {
      const { data: studentData } = await supabase
        .from('students')
        .select('*');

      return NextResponse.json({
        success: true,
        data: studentData || []
      });
    }

    return NextResponse.json({
      success: true,
      data
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      data: []
    });
  }
}
