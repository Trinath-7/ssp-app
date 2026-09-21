import { NextRequest, NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/db/supabaseAdapter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, anonKey, serviceRoleKey } = body;

    const testKey = serviceRoleKey || anonKey;

    if (!url || !testKey) {
      return NextResponse.json(
        { success: false, message: 'Please provide both Supabase Project URL and API Key.' },
        { status: 400 }
      );
    }

    const result = await testSupabaseConnection(url.trim(), testKey.trim());
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Error executing connection test', latencyMs: 0 },
      { status: 500 }
    );
  }
}
