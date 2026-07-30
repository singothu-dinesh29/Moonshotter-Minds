import { NextRequest, NextResponse } from 'next/server';
import { supabase, getSupabaseAdmin } from '@/lib/supabase';
import { verifyAdminSession } from '@/lib/serverSecurity';

export async function GET(request: NextRequest) {
  const security = verifyAdminSession(request);
  if (!security.isAdmin && security.errorResponse) {
    return security.errorResponse;
  }

  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Question GET Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      questions: data,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Database fetch error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const security = verifyAdminSession(request);
  if (!security.isAdmin && security.errorResponse) {
    return security.errorResponse;
  }

  try {
    const body = await request.json();
    const dbClient = getSupabaseAdmin();
    
    // Perform database INSERT / UPSERT operation
    let activePayload = {
      ...body,
      updated_at: new Date().toISOString()
    };

    let { data, error } = await dbClient
      .from('questions')
      .upsert(activePayload)
      .select();

    while (error && error.message && error.message.includes("schema cache")) {
      const match = error.message.match(/Could not find the '([^']+)' column/);
      if (match && match[1] && activePayload[match[1]] !== undefined) {
        delete activePayload[match[1]];
        const retryRes = await supabase.from('questions').upsert(activePayload).select();
        data = retryRes.data;
        error = retryRes.error;
      } else {
        break;
      }
    }

    if (error) {
      console.error('Supabase Question POST Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Question authored/updated successfully in Supabase database.',
      question: data ? data[0] : body
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Invalid JSON request payload.' }, { status: 400 });
  }
}
