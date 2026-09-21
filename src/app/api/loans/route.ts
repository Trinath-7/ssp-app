import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const loanType = searchParams.get('loanType') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const agentId = searchParams.get('agentId') || undefined;
    const search = searchParams.get('search') || undefined;

    const loans = db.getLoans({ status, loanType, customerId, agentId, search });
    return NextResponse.json(loans);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerId || !body.principalAmount || !body.interestRate || !body.tenureMonths) {
      return NextResponse.json(
        { error: 'Customer, Principal Amount, Interest Rate, and Tenure are required' },
        { status: 400 }
      );
    }

    const newLoan = db.createLoan(body);
    return NextResponse.json(newLoan, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
