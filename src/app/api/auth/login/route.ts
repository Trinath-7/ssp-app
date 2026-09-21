import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();

    // If role is explicitly provided (e.g. demo role switcher), select user with that role
    let user;
    if (role) {
      user = db.getUsers().find((u) => u.role === role);
    } else if (email) {
      user = db.getUserByEmail(email);
    }

    if (!user) {
      // Default fallback to Admin for demo convenience if invalid credentials
      user = db.getUsers()[0];
    }

    // Return authenticated session
    return NextResponse.json({
      success: true,
      user,
      token: `ssp-token-${user.id}-${Date.now()}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
