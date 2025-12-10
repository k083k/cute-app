import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

// Create users table if it doesn't exist
async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
  } catch (error) {
    console.error('Error creating users table:', error);
  }
}

// GET - Check if users are set up
export async function GET() {
  try {
    await ensureTable();

    const { rows } = await sql`
      SELECT id, name, created_at
      FROM users
      ORDER BY created_at ASC
    `;

    return NextResponse.json({
      isSetup: rows.length > 0,
      users: rows.map(row => ({ id: row.id, name: row.name })),
    });
  } catch (error) {
    console.error('Error checking users:', error);
    return NextResponse.json(
      { error: 'Failed to check users', details: String(error) },
      { status: 500 }
    );
  }
}

// POST - Create new user with password
export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const { name, password } = body;

    if (!name || !password) {
      return NextResponse.json(
        { error: 'Name and password are required' },
        { status: 400 }
      );
    }

    // Check how many users exist
    const { rows: existingUsers } = await sql`SELECT COUNT(*) as count FROM users`;
    const userCount = parseInt(existingUsers[0].count);

    if (userCount >= 2) {
      return NextResponse.json(
        { error: 'Maximum number of users reached' },
        { status: 400 }
      );
    }

    // Generate user ID based on order
    const userId = userCount === 0 ? 'user1' : 'user2';

    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    await sql`
      INSERT INTO users (id, name, password_hash)
      VALUES (${userId}, ${name}, ${passwordHash})
    `;

    return NextResponse.json({
      success: true,
      userId,
      name,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user', details: String(error) },
      { status: 500 }
    );
  }
}
