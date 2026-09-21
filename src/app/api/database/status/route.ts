import { NextResponse } from 'next/server';
import { getSupabaseStatus } from '@/lib/db/supabaseAdapter';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const supabaseStatus = await getSupabaseStatus();
    const localDb = getDatabase();

    const localStats = {
      customers: localDb.customers?.length || 0,
      properties: localDb.properties?.length || 0,
      loans: localDb.loans?.length || 0,
      payments: localDb.payments?.length || 0,
      vehicles: localDb.vehicles?.length || 0,
      agents: localDb.agents?.length || 0,
      documents: localDb.documents?.length || 0,
      users: localDb.users?.length || 0,
    };

    return NextResponse.json({
      success: true,
      activeEngine: supabaseStatus.isConnected ? 'Supabase Cloud Database' : 'Local Relational JSON Engine',
      isSupabaseConfigured: supabaseStatus.isConfigured,
      isSupabaseConnected: supabaseStatus.isConnected,
      supabaseUrl: supabaseStatus.url ? supabaseStatus.url.replace(/(https?:\/\/)([^.]+).*/, '$1$2...') : null,
      latencyMs: supabaseStatus.latencyMs,
      tableCounts: supabaseStatus.isConnected ? supabaseStatus.tableCounts : localStats,
      localStats,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to inspect database status' },
      { status: 500 }
    );
  }
}
