import { NextRequest, NextResponse } from 'next/server';
import { gameStateManager, GameState } from '@/lib/gameStateManager';
import { sql } from '@/lib/db';

// Ensure the game_history table exists
async function ensureHistoryTable() {
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
  }
}

// GET: Fetch current game state (fallback for initial load)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') || 'tic-tac-toe';

    const game = gameStateManager.getGame(gameType);

    return NextResponse.json({ game: game || null });
  } catch (error) {
    console.error('Error fetching game state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game state', details: String(error) },
      { status: 500 }
    );
  }
}

// POST: Create or update game state
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      gameType,
      playerX,
      playerO,
      board,
      currentTurn,
      winner,
      isDraw,
      newGameRequestedBy
    } = body;

    if (!id || !gameType || !playerX || !playerO || !board || !currentTurn) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse board if it's a string
    const parsedBoard = typeof board === 'string' ? JSON.parse(board) : board;

    const gameState: GameState = {
      id,
      gameType,
      playerX,
      playerO,
      board: parsedBoard,
      currentTurn,
      winner: winner || null,
      isDraw: isDraw || false,
      newGameRequestedBy: newGameRequestedBy || null,
      updatedAt: Date.now(),
    };

    // Update in-memory state (this will trigger SSE broadcast)
    gameStateManager.setGame(gameState);

    // If game is finished, save to history
    if (winner || isDraw) {
      await ensureHistoryTable();
      const result = isDraw ? 'draw' : 'win';

      try {
        await sql`
          INSERT INTO game_history (id, game_type, player_x, player_o, winner, result, created_at)
          VALUES (${id + '-result'}, ${gameType}, ${playerX}, ${playerO}, ${winner || null}, ${result}, NOW())
          ON CONFLICT (id) DO NOTHING
        `;
      } catch (error) {
        console.error('Error saving game history:', error);
      }
    }

    return NextResponse.json({ success: true, game: gameState });
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
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('id');

    if (!gameId) {
      return NextResponse.json(
        { error: 'Missing game ID' },
        { status: 400 }
      );
    }

    gameStateManager.deleteGame(gameId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting game:', error);
    return NextResponse.json(
      { error: 'Failed to delete game', details: String(error) },
      { status: 500 }
    );
  }
}
