import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, SessionData } from '@/lib/session';

// Simple in-memory rate limiter — 10 attempts per 15 minutes per IP.
// Note: resets across serverless cold starts. For stricter limits use Upstash Redis.
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }

  if (record.count >= 10) return true;
  record.count++;
  return false;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const { rows } = await sql`
      SELECT id, name, password_hash
      FROM users
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'No users found. Please set up your account first.' },
        { status: 404 }
      );
    }

    for (const user of rows) {
      const isMatch = await bcrypt.compare(password, user.password_hash);

      if (isMatch) {
        const cookieStore = await cookies();
        const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

        session.userId = user.id;
        session.userName = user.name;
        session.isAuthenticated = true;

        await session.save();

        return NextResponse.json({
          success: true,
          user: { id: user.id, name: user.name },
        });
      }
    }

    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
