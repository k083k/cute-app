import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Ensure the active_games table exists
async function ensureTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS active_games (
        id TEXT PRIMARY KEY,
        game_type TEXT NOT NULL,
        player_x TEXT NOT NULL,
        player_o TEXT NOT NULL,
        board TEXT NOT NULL,
        current_turn TEXT NOT NULL,
        winner TEXT,
        is_draw BOOLEAN DEFAULT FALSE,
        new_game_requested_by TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
  } catch (error) {
    console.error('Error creating active_games table:', error);
    throw error;
  }
}

// GET: Fetch current active game
export async function GET(request: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') || 'tic-tac-toe';

    // Get the most recent active game (including finished games so both players can see the final state)
    const { rows } = await sql`
      SELECT id, game_type, player_x, player_o, board, current_turn, winner, is_draw, new_game_requested_by, updated_at
      FROM active_games
      WHERE game_type = ${gameType}
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ game: null });
    }

    return NextResponse.json({ game: rows[0] });
  } catch (error) {
    console.error('Error fetching active game:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active game', details: String(error) },
      { status: 500 }
    );
  }
}

// POST: Create or update game state
export async function POST(request: NextRequest) {
  try {
    await ensureTable();

    const body = await request.json();
    const { id, gameType, playerX, playerO, board, currentTurn, winner, isDraw, newGameRequestedBy } = body;

    if (!id || !gameType || !playerX || !playerO || !board || !currentTurn) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if game exists
    const { rows: existing } = await sql`
      SELECT id FROM active_games WHERE id = ${id}
    `;

    if (existing.length > 0) {
      // Update existing game (including player names in case second player joined)
      await sql`
        UPDATE active_games
        SET board = ${board},
            current_turn = ${currentTurn},
            player_x = ${playerX},
            player_o = ${playerO},
            winner = ${winner || null},
            is_draw = ${isDraw || false},
            new_game_requested_by = ${newGameRequestedBy || null},
            updated_at = NOW()
        WHERE id = ${id}
      `;
    } else {
      // Create new game
      await sql`
        INSERT INTO active_games (id, game_type, player_x, player_o, board, current_turn, winner, is_draw, new_game_requested_by, updated_at)
        VALUES (${id}, ${gameType}, ${playerX}, ${playerO}, ${board}, ${currentTurn}, ${winner || null}, ${isDraw || false}, ${newGameRequestedBy || null}, NOW())
      `;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving game state:', error);
    return NextResponse.json(
      { error: 'Failed to save game state', details: String(error) },
      { status: 500 }
    );
  }
}

// DELETE: Clear finished game
export async function DELETE(request: NextRequest) {
  try {
    await ensureTable();

    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('id');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing game ID' },
        { status: 400 }
      );
    }

    await sql`
      DELETE FROM active_games WHERE id = ${gameId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game', details: String(error) },
      { status: 500 }
    );
  }
}
