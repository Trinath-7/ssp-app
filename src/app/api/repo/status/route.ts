import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { vehicleId, newStatus, user, role, notes, location } = await request.json();

    if (!vehicleId || !newStatus) {
      return NextResponse.json(
        { error: 'Vehicle ID and New Status are required' },
        { status: 400 }
      );
    }

    const result = db.updateRepoStatus(
      vehicleId,
      newStatus,
      user || 'Rahul Sharma',
      role || 'AGENT',
      notes || '',
      location
    );

    if (!result) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
