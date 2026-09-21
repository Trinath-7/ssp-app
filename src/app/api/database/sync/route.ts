import { NextRequest, NextResponse } from 'next/server';
import { syncDataToSupabase } from '@/lib/db/supabaseAdapter';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const { url, anonKey, serviceRoleKey } = body;
    const keyToUse = serviceRoleKey || anonKey;

    const result = await syncDataToSupabase(url, keyToUse);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Sync to Supabase failed:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to synchronize data with Supabase',
        hint: 'Make sure the database tables have been created using schema.sql before syncing records.',
      },
      { status: 500 }
    );
  }
}
