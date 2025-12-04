import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from '@/lib/session';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    // Get the secret code from environment variable
    const CORRECT_CODE = process.env.SECRET_CODE;

    // Check if environment variable is set
    if (!CORRECT_CODE) {
      console.error('SECRET_CODE environment variable is not set');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Validate the code
    if (code.toLowerCase() !== CORRECT_CODE.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: 'Incorrect code. Try again!' },
        { status: 401 }
      );
    }

    // Create session
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    session.isAuthenticated = true;
    session.authenticatedAt = Date.now();
    await session.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
