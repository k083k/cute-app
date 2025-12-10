import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

// Create table if it doesn't exist
async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS sticky_notes (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        author TEXT NOT NULL,
        color TEXT NOT NULL,
        x REAL NOT NULL,
        y REAL NOT NULL,
        rotation REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Migrate existing table if columns are wrong type
    // This will fail silently if columns are already REAL
    try {
      await sql`ALTER TABLE sticky_notes ALTER COLUMN x TYPE REAL`;
      await sql`ALTER TABLE sticky_notes ALTER COLUMN y TYPE REAL`;
    } catch (alterError) {
      // Ignore - columns already correct type
    }
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

// GET - Fetch all notes
export async function GET() {
  try {
    await ensureTable();

    const { rows } = await sql`
      SELECT
        id,
        content,
        author,
        color,
        x,
        y,
        rotation,
        created_at as "createdAt"
      FROM sticky_notes
      ORDER BY created_at DESC
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching notes:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// POST - Create a new note
export async function POST(request: Request) {
  try {
    await ensureTable();

    const body = await request.json();
    const { id, content, author, color, x, y, rotation } = body;

    await sql`
      INSERT INTO sticky_notes (id, content, author, color, x, y, rotation, created_at)
      VALUES (${id}, ${content}, ${author}, ${color}, ${x}, ${y}, ${rotation}, CURRENT_TIMESTAMP)
    `;

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Error creating note:', error);
    // Return more detailed error information
    return NextResponse.json({
      error: 'Failed to create note',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
    }, { status: 500 });
  }
}

// DELETE - Delete a note
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 });
    }

    await sql`DELETE FROM sticky_notes WHERE id = ${id}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 });
  }
}

// PUT - Update note position
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, x, y } = body;

    await sql`
      UPDATE sticky_notes
      SET x = ${x}, y = ${y}
      WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
