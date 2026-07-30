import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sortLeaderboardRecords } from '@/lib/scoringEngine';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('total_score', { ascending: false })
      .order('completion_time_seconds', { ascending: true })
      .order('anti_cheat_flag_count', { ascending: true, nullsFirst: false });

    if (error || !data || data.length === 0) {
      const { data: studentData } = await supabase
        .from('students')
        .select('*');

      const ranked = sortLeaderboardRecords(studentData || []);
      return NextResponse.json({
        success: true,
        data: ranked
      });
    }

    const rankedData = sortLeaderboardRecords(data);
    return NextResponse.json({
      success: true,
      data: rankedData
    });
  } catch (err) {
    return NextResponse.json({
      success: false,
      data: []
    });
  }
}
