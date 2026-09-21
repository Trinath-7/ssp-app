import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const repoStatus = searchParams.get('repoStatus') || undefined;
    const vehicleType = searchParams.get('vehicleType') || undefined;
    const search = searchParams.get('search') || undefined;
    const agentId = searchParams.get('agentId') || undefined;

    const vehicles = db.getVehicles({ repoStatus, vehicleType, search, agentId });
    return NextResponse.json(vehicles);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.regNumber || !body.make || !body.model || !body.ownerName) {
      return NextResponse.json(
        { error: 'Registration Number, Make, Model, and Owner Name are required' },
        { status: 400 }
      );
    }

    const newVehicle = db.createVehicle(body);
    return NextResponse.json(newVehicle, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
