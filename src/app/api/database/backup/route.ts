import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'json';

    if (format === 'sql') {
      const schemaPath = path.join(process.cwd(), 'schema.sql');
      const schemaSql = fs.existsSync(schemaPath)
        ? fs.readFileSync(schemaPath, 'utf8')
        : '-- Schema file not found';

      return new NextResponse(schemaSql, {
        status: 200,
        headers: {
          'Content-Type': 'application/sql',
          'Content-Disposition': 'attachment; filename="ssp_database_schema.sql"',
        },
      });
    }

    // Default: JSON snapshot
    const db = getDatabase();
    const jsonStr = JSON.stringify(db, null, 2);

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ssp_database_backup_${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to export backup' },
      { status: 500 }
    );
  }
}
