import { NextResponse } from 'next/server';
import { evaluateCodeSubmission } from '@/lib/evaluator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, testCases, points } = body;

    if (!code || !testCases) {
      return NextResponse.json({ error: 'Missing required evaluation parameters' }, { status: 400 });
    }

    const result = evaluateCodeSubmission(code, testCases, points || 50);

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal evaluation error' }, { status: 500 });
  }
}
