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

  /**
   * Get or create a game state
   */
  getGame(gameType: string): GameState | null {
    // Find the most recent game for this game type
    const games = Array.from(this.games.values())
      .filter(g => g.gameType === gameType)
      .sort((a, b) => b.updatedAt - a.updatedAt);

    return games[0] || null;
  }

  /**
   * Create or update a game state
   */
  setGame(gameState: GameState): void {
    this.games.set(gameState.id, {
      ...gameState,
      updatedAt: Date.now(),
    });

    // Notify all listeners for this game type
    this.notifyListeners(gameState.gameType, gameState);
  }

  /**
   * Delete a game
   */
  deleteGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (game) {
      this.games.delete(gameId);
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

    // Send current state immediately
    const currentGame = this.getGame(gameType);
    if (currentGame) {
      listener(currentGame);
    }

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
   * Clean up old games (older than 24 hours)
   */
  cleanup(): void {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const gamesToDelete: string[] = [];

    this.games.forEach((game, id) => {
      if (game.updatedAt < oneDayAgo) {
        gamesToDelete.push(id);
      }
    });

    gamesToDelete.forEach(id => this.games.delete(id));
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
