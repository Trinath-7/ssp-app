import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const search = searchParams.get('search') || undefined;

    const payments = db.getPayments({ loanId, customerId, search });
    return NextResponse.json(payments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.loanId || !body.amount || !body.paymentMethod) {
      return NextResponse.json(
        { error: 'Loan ID, Amount, and Payment Method are required' },
        { status: 400 }
      );
    }

    const newPayment = db.recordPayment(body);
    return NextResponse.json(newPayment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
