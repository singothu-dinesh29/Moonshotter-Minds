import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const text = await request.text();
    const body = JSON.parse(text);
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter both username and password.' },
        { status: 400 }
      );
    }

    const trimmedUsername = String(username).trim();
    const trimmedPassword = String(password).trim();

    // 1. ADMIN AUTHENTICATION
    const adminUser = process.env.ADMIN_USERNAME || 'Dinesh';
    const adminPass = process.env.ADMIN_PASSWORD || 'Dinesh@2006';

    if (trimmedUsername === adminUser && trimmedPassword === adminPass) {
      const response = NextResponse.json({
        success: true,
        role: 'ADMIN',
        redirectTo: '/admin/dashboard',
        user: {
          id: 'u-admin-dinesh',
          username: 'Dinesh',
          email: 'dinesh.admin@mec.edu.in',
          full_name: 'Dinesh (System Administrator)',
          college_name: 'Muthayammal Executive Committee',
          role: 'ADMIN'
        }
      });

      response.cookies.set('symphosium_role', 'ADMIN', {
        path: '/',
        httpOnly: false,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7
      });

      return response;
    }

    // 2. CANDIDATE AUTHENTICATION AGAINST SUPABASE DATABASE
    const cleanQuery = trimmedUsername.toLowerCase();
    
    // Search Supabase `users` table for email or full_name
    const { data: dbUsers } = await supabase
      .from('users')
      .select('*')
      .or(`email.ilike.%${cleanQuery}%,full_name.ilike.%${cleanQuery}%`);

    let foundUser = dbUsers?.[0];

    // Search exact email if ilike query returned empty
    if (!foundUser) {
      const { data: exactEmailUser } = await supabase
        .from('users')
        .select('*')
        .eq('email', cleanQuery)
        .maybeSingle();
      foundUser = exactEmailUser || undefined;
    }

    // Fallback demo candidate check
    if (!foundUser && (cleanQuery.includes('alex') || cleanQuery.includes('candidate') || cleanQuery.includes('demo'))) {
      foundUser = {
        id: 'u-demo-1',
        email: 'alex.chen@mit.edu',
        full_name: 'Alex Chen',
        college_name: 'Muthayammal Engineering College',
        role: 'STUDENT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    if (!foundUser) {
      return NextResponse.json(
        { success: false, error: 'Account not found in Supabase database. Please register first.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      role: 'STUDENT',
      redirectTo: '/student/dashboard',
      user: {
        id: foundUser.id,
        username: foundUser.email,
        email: foundUser.email,
        full_name: foundUser.full_name,
        college_name: foundUser.college_name || 'Muthayammal Engineering College',
        role: 'STUDENT'
      }
    });

    response.cookies.set('symphosium_role', 'STUDENT', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Invalid username or password.' },
      { status: 400 }
    );
  }
}
