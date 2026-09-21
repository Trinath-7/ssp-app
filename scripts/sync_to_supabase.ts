/**
 * CLI Script: Sync SSP Properties & Loans Database to Supabase
 * Usage: npx tsx scripts/sync_to_supabase.ts
 */

import { syncDataToSupabase, testSupabaseConnection } from '../src/lib/db/supabaseAdapter';

async function main() {
  console.log('====================================================');
  console.log('  SSP PROPERTIES & LOANS - SUPABASE SYNC UTILITY');
  console.log('====================================================\n');

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('❌ Error: Supabase credentials not found in environment.');
    console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env.local');
    process.exit(1);
  }

  console.log(`📡 Connecting to Supabase at: ${url}`);
  const testResult = await testSupabaseConnection(url, key);

  if (!testResult.success) {
    console.error(`❌ Connection test failed: ${testResult.message}`);
    process.exit(1);
  }

  console.log(`✅ Connection test passed in ${testResult.latencyMs}ms!`);
  console.log('🚀 Synchronizing all 13 tables & sample commercial records...');

  try {
    const syncResult = await syncDataToSupabase(url, key);
    console.log(`\n🎉 ${syncResult.message}\n`);
    console.log('Table Breakdown:');
    Object.entries(syncResult.results).forEach(([table, count]) => {
      console.log(`  • ${table.padEnd(20)}: ${count} rows`);
    });
    console.log('\n✅ Database sync completed successfully!');
  } catch (err: any) {
    console.error(`\n❌ Synchronization error: ${err.message}`);
    console.error('Tip: Make sure you ran schema.sql in your Supabase SQL Editor before running the sync.');
    process.exit(1);
  }
}

main();
