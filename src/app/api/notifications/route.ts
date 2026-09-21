import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const notifications = db.getNotifications();
    return NextResponse.json(notifications);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (body.all) {
      db.markAllNotificationsRead();
      return NextResponse.json({ success: true });
    } else if (body.id) {
      db.markNotificationRead(body.id);
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Provide id or all: true' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
