import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const agents = db.getAgents({ search });
    return NextResponse.json(agents);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Name and Phone are required' },
        { status: 400 }
      );
    }

    const newAgent = db.createAgent({
      ...body,
      status: body.status || 'Active',
      assignedCasesCount: body.assignedCasesCount || 0,
      completedCasesCount: body.completedCasesCount || 0,
      rating: body.rating || 5.0,
      joiningDate: body.joiningDate || new Date().toISOString().split('T')[0],
    });

    return NextResponse.json(newAgent, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
