import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, collegeName, phone, password } = body || {};

    if (!fullName || !email || !collegeName || !password) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanName = String(fullName).trim();
    const cleanCollege = String(collegeName).trim();

    // 1. Insert candidate into Supabase `public.users` table
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .upsert(
        {
          email: cleanEmail,
          full_name: cleanName,
          college_name: cleanCollege,
          role: 'STUDENT',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (userError) {
      console.error('Supabase user insert error:', userError);
      return NextResponse.json(
        { success: false, error: 'Database insertion error: ' + userError.message },
        { status: 500 }
      );
    }

    // 2. Fetch active event ID from Supabase `public.events`
    const { data: events } = await supabase
      .from('events')
      .select('id')
      .limit(1);

    const eventId = events?.[0]?.id;

    if (eventId && newUser?.id) {
      // Create candidate event registration in Supabase `public.registrations`
      await supabase.from('registrations').upsert(
        {
          user_id: newUser.id,
          event_id: eventId,
          status: 'REGISTERED',
        },
        { onConflict: 'user_id,event_id' }
      );
    }

    // Return success response and set authentication cookie
    const response = NextResponse.json({
      success: true,
      message: 'Registration successful! Candidate saved to live Supabase database.',
      user: newUser,
    });

    response.cookies.set('symphosium_role', 'STUDENT', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Registration failed.' },
      { status: 500 }
    );
  }
}
