import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const propertyType = searchParams.get('propertyType') || undefined;
    const city = searchParams.get('city') || undefined;
    const search = searchParams.get('search') || undefined;

    const properties = db.getProperties({ status, propertyType, city, search });
    return NextResponse.json(properties);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.price || !body.propertyType || !body.location) {
      return NextResponse.json(
        { error: 'Title, Price, Property Type, and Location are required' },
        { status: 400 }
      );
    }

    const newProperty = db.createProperty(body);
    return NextResponse.json(newProperty, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
