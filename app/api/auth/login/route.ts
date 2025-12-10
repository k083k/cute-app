import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Get all users
    const { rows } = await sql`
      SELECT id, name, password_hash
      FROM users
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No users found. Please set up your password first.' },
        { status: 404 }
      );
    }

    // Check password against all users
    for (const user of rows) {
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (isMatch) {
        // Password matches! Create session
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        session.userId = user.id;
        session.userName = user.name;
        session.isAuthenticated = true;

        await session.save();

        return NextResponse.json({
          success: true,
          user: {
            id: user.id,
            name: user.name,
          },
        });
      }
    }

    // No password matched
    return NextResponse.json(
      { error: 'Incorrect password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed', details: String(error) },
      { status: 500 }
    );
  }
}
