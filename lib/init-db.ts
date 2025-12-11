import { sql } from './db';

/**
 * Initialize database tables for game state persistence
 */
export async function initializeDatabase() {
  try {
    // Create active_games table
    await sql`
      CREATE TABLE IF NOT EXISTS active_games (
        id TEXT PRIMARY KEY,
        game_type TEXT NOT NULL,
        player_x TEXT NOT NULL,
        player_o TEXT NOT NULL,
        board JSONB NOT NULL,
        current_turn TEXT NOT NULL,
        winner TEXT,
        is_draw BOOLEAN DEFAULT FALSE,
        new_game_requested_by TEXT,
        updated_at BIGINT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    // Create index for faster game type lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_active_games_game_type
      ON active_games(game_type)
    `;

    // Create index for cleanup queries
    await sql`
      CREATE INDEX IF NOT EXISTS idx_active_games_updated_at
      ON active_games(updated_at)
    `;

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
