import { sql } from './db';
import { initializeDatabase } from './init-db';

type Player = 'X' | 'O' | null;
type Board = Player[];

export interface GameState {
  id: string;
  gameType: string;
  playerX: string;
  playerO: string;
  board: Board;
  currentTurn: 'X' | 'O';
  winner: string | null;
  isDraw: boolean;
  newGameRequestedBy: string | null;
  updatedAt: number;
}

type GameStateListener = (gameState: GameState) => void;

class GameStateManager {
  private games: Map<string, GameState> = new Map();
  private listeners: Map<string, Set<GameStateListener>> = new Map();
  private isInitialized = false;

  /**
   * Initialize database tables
   */
  private async initialize() {
    if (this.isInitialized) return;
    try {
      await initializeDatabase();
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  /**
   * Get or create a game state (now with database persistence)
   */
  async getGame(gameType: string): Promise<GameState | null> {
    await this.initialize();

    // First check in-memory cache
    const cachedGames = Array.from(this.games.values())
      .filter(g => g.gameType === gameType)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    if (cachedGames.length > 0) {
      return cachedGames[0];
    }

    // If not in cache, check database
    try {
      const result = await sql`
        SELECT * FROM active_games
        WHERE game_type = ${gameType}
        ORDER BY updated_at DESC
        LIMIT 1
      `;

      if (result.rows.length > 0) {
        const row = result.rows[0];
        const gameState: GameState = {
          id: row.id,
          gameType: row.game_type,
          playerX: row.player_x,
          playerO: row.player_o,
          board: row.board,
          currentTurn: row.current_turn as 'X' | 'O',
          winner: row.winner,
          isDraw: row.is_draw,
          newGameRequestedBy: row.new_game_requested_by,
          updatedAt: row.updated_at,
        };

        // Cache it in memory
        this.games.set(gameState.id, gameState);
        return gameState;
      }
    } catch (error) {
      console.error('Error fetching game from database:', error);
    }

    return null;
  }

  /**
   * Create or update a game state (now with database persistence)
   */
  async setGame(gameState: GameState): Promise<void> {
    await this.initialize();

    const updatedGameState = {
      ...gameState,
      updatedAt: Date.now(),
    };

    // Update in-memory cache
    this.games.set(updatedGameState.id, updatedGameState);

    // Persist to database
    try {
      await sql`
        INSERT INTO active_games (
          id, game_type, player_x, player_o, board, current_turn,
          winner, is_draw, new_game_requested_by, updated_at
        )
        VALUES (
          ${updatedGameState.id},
          ${updatedGameState.gameType},
          ${updatedGameState.playerX},
          ${updatedGameState.playerO},
          ${JSON.stringify(updatedGameState.board)},
          ${updatedGameState.currentTurn},
          ${updatedGameState.winner},
          ${updatedGameState.isDraw},
          ${updatedGameState.newGameRequestedBy},
          ${updatedGameState.updatedAt}
        )
        ON CONFLICT (id) DO UPDATE SET
          board = EXCLUDED.board,
          current_turn = EXCLUDED.current_turn,
          winner = EXCLUDED.winner,
          is_draw = EXCLUDED.is_draw,
          new_game_requested_by = EXCLUDED.new_game_requested_by,
          updated_at = EXCLUDED.updated_at
      `;
    } catch (error) {
      console.error('Error persisting game to database:', error);
    }

    // Notify all listeners for this game type
    this.notifyListeners(gameState.gameType, updatedGameState);
  }

  /**
   * Delete a game (now with database persistence)
   */
  async deleteGame(gameId: string): Promise<void> {
    await this.initialize();

    const game = this.games.get(gameId);
    if (game) {
      // Delete from in-memory cache
      this.games.delete(gameId);

      // Delete from database
      try {
        await sql`DELETE FROM active_games WHERE id = ${gameId}`;
      } catch (error) {
        console.error('Error deleting game from database:', error);
      }

      // Notify listeners that the game was deleted
      this.notifyListeners(game.gameType, null);
    }
  }

  /**
   * Subscribe to game state changes for a specific game type
   */
  subscribe(gameType: string, listener: GameStateListener): () => void {
    if (!this.listeners.has(gameType)) {
      this.listeners.set(gameType, new Set());
    }

    this.listeners.get(gameType)!.add(listener);

    // Send current state immediately (async)
    this.getGame(gameType).then(currentGame => {
      if (currentGame) {
        listener(currentGame);
      }
    }).catch(error => {
      console.error('Error getting current game on subscribe:', error);
    });

    // Return unsubscribe function
    return () => {
      const gameListeners = this.listeners.get(gameType);
      if (gameListeners) {
        gameListeners.delete(listener);
        if (gameListeners.size === 0) {
          this.listeners.delete(gameType);
        }
      }
    };
  }

  /**
   * Notify all listeners for a game type
   */
  private notifyListeners(gameType: string, gameState: GameState | null): void {
    const gameListeners = this.listeners.get(gameType);
    if (gameListeners && gameState) {
      gameListeners.forEach(listener => listener(gameState));
    }
  }

  /**
   * Get all active listeners count
   */
  getListenerCount(gameType?: string): number {
    if (gameType) {
      return this.listeners.get(gameType)?.size || 0;
    }
    return Array.from(this.listeners.values()).reduce((sum, set) => sum + set.size, 0);
  }

  /**
   * Clean up old games (older than 24 hours) from both memory and database
   */
  async cleanup(): Promise<void> {
    await this.initialize();

    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const gamesToDelete: string[] = [];

    // Clean up in-memory cache
    this.games.forEach((game, id) => {
      if (game.updatedAt < oneDayAgo) {
        gamesToDelete.push(id);
      }
    });

    gamesToDelete.forEach(id => this.games.delete(id));

    // Clean up database
    try {
      await sql`DELETE FROM active_games WHERE updated_at < ${oneDayAgo}`;
    } catch (error) {
      console.error('Error cleaning up old games from database:', error);
    }
  }
}

// Export singleton instance
export const gameStateManager = new GameStateManager();

// Run cleanup every hour
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    gameStateManager.cleanup();
  }, 60 * 60 * 1000);
}
