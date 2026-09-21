import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, anonKey, serviceRoleKey, databaseUrl } = body;

    const envPath = path.join(process.cwd(), '.env.local');
    let existingContent = '';
    if (fs.existsSync(envPath)) {
      existingContent = fs.readFileSync(envPath, 'utf8');
    }

    const envVars: Record<string, string> = {};

    // Parse existing .env.local
    existingContent.split('\n').forEach((line) => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = (match[2] || '').trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
        envVars[match[1]] = val;
      }
    });

    if (url) {
      envVars['NEXT_PUBLIC_SUPABASE_URL'] = url.trim();
      process.env.NEXT_PUBLIC_SUPABASE_URL = url.trim();
    }
    if (anonKey) {
      envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = anonKey.trim();
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = anonKey.trim();
    }
    if (serviceRoleKey) {
      envVars['SUPABASE_SERVICE_ROLE_KEY'] = serviceRoleKey.trim();
      process.env.SUPABASE_SERVICE_ROLE_KEY = serviceRoleKey.trim();
    }
    if (databaseUrl) {
      envVars['DATABASE_URL'] = databaseUrl.trim();
      process.env.DATABASE_URL = databaseUrl.trim();
    }

    // Write back to .env.local
    const updatedContent = Object.entries(envVars)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    fs.writeFileSync(envPath, updatedContent + '\n', 'utf8');

    return NextResponse.json({
      success: true,
      message: 'Supabase configuration saved to .env.local and runtime environment successfully!',
      isConfigured: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to save configuration' },
      { status: 500 }
    );
  }
}
