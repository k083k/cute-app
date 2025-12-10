import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// GET: Fetch game statistics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameType = searchParams.get('gameType') || 'tic-tac-toe';

    // Get all unique players
    const { rows: players } = await sql`
      SELECT DISTINCT unnest(ARRAY[player_x, player_o]) as player_name
      FROM game_history
      WHERE game_type = ${gameType}
    `;

    // Get stats for each player
    const stats: Record<string, any> = {};

    for (const { player_name } of players) {
      const { rows } = await sql`
        SELECT
          COUNT(*) as total_games,
          SUM(CASE WHEN winner = ${player_name} THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws,
          SUM(CASE WHEN winner IS NOT NULL AND winner != ${player_name} THEN 1 ELSE 0 END) as losses
        FROM game_history
        WHERE game_type = ${gameType}
          AND (player_x = ${player_name} OR player_o = ${player_name})
      `;

      stats[player_name] = {
        totalGames: parseInt(rows[0].total_games) || 0,
        wins: parseInt(rows[0].wins) || 0,
        draws: parseInt(rows[0].draws) || 0,
        losses: parseInt(rows[0].losses) || 0,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching game stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game stats', details: String(error) },
      { status: 500 }
    );
  }
}
