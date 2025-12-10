import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (session.isAuthenticated) {
      return NextResponse.json({
        isAuthenticated: true,
        user: {
          id: session.userId,
          name: session.userName,
        },
      });
    }

    return NextResponse.json({
      isAuthenticated: false,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { isAuthenticated: false },
      { status: 500 }
    );
  }
}
