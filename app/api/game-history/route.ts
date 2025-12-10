import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Ensure the game_history table exists
async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS game_history (
        id TEXT PRIMARY KEY,
        game_type TEXT NOT NULL,
        player_x TEXT NOT NULL,
        player_o TEXT NOT NULL,
        winner TEXT,
        result TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (error) {
    console.error('Error creating game_history table:', error);
    throw error;
  }
}

// GET: Fetch game history
export async function GET(request: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') || 'tic-tac-toe';

    const { rows } = await sql`
      SELECT id, game_type, player_x, player_o, winner, result, created_at
      FROM game_history
      WHERE game_type = ${gameType}
      ORDER BY created_at DESC
      LIMIT 100
    `;

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching game history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game history', details: String(error) },
      { status: 500 }
    );
  }
}

// POST: Add new game result
export async function POST(request: NextRequest) {
  try {
    await ensureTable();

    const body = await request.json();
    const { id, gameType, playerX, playerO, winner, result } = body;

    if (!id || !gameType || !playerX || !playerO || !result) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO game_history (id, game_type, player_x, player_o, winner, result, created_at)
      VALUES (${id}, ${gameType}, ${playerX}, ${playerO}, ${winner || null}, ${result}, NOW())
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving game result:', error);
    return NextResponse.json(
      { error: 'Failed to save game result', details: String(error) },
      { status: 500 }
    );
  }
}
