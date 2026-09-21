import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const entityType = searchParams.get('entityType') || undefined;
    const entityId = searchParams.get('entityId') || undefined;
    const search = searchParams.get('search') || undefined;

    const documents = db.getDocuments({ category, entityType, entityId, search });
    return NextResponse.json(documents);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.category) {
      return NextResponse.json(
        { error: 'Document Name and Category are required' },
        { status: 400 }
      );
    }

    const newDoc = db.createDocument({
      name: body.name,
      category: body.category,
      fileType: body.fileType || 'pdf',
      fileSize: body.fileSize || '1.2 MB',
      fileUrl: body.fileUrl || `/uploads/${body.name.toLowerCase().replace(/\s+/g, '_')}`,
      entityType: body.entityType || 'General',
      entityId: body.entityId,
      entityName: body.entityName,
      uploadedBy: body.uploadedBy || 'Admin',
    });

    return NextResponse.json(newDoc, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
