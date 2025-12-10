'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faCircle } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

type Player = 'X' | 'O' | null;
type Board = Player[];

interface GameStats {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

export default function TicTacToePage() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ 'X': 0, 'O': 0, draws: 0 });
  const [allTimeStats, setAllTimeStats] = useState<Record<string, GameStats>>({});
  const [gameId, setGameId] = useState<string>('');
  const [myPlayer, setMyPlayer] = useState<'X' | 'O' | null>(null);
  const [playerNames, setPlayerNames] = useState<{ X: string; O: string }>({ X: '', O: '' });
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [newGameRequestedBy, setNewGameRequestedBy] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndAssignPlayer();
    fetchGameStats();
  }, []);

  useEffect(() => {
    // Poll for game updates every 500ms for near real-time feedback
    if (!gameId) return;

    const interval = setInterval(() => {
      syncGameState();
    }, 500);

    return () => clearInterval(interval);
  }, [gameId]);

  const checkAuthAndAssignPlayer = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (data.isAuthenticated && data.user) {
        setCurrentUserName(data.user.name);
      }

      // Load or create active game
      await loadOrCreateGame(data.user?.name);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const loadOrCreateGame = async (userName?: string) => {
    try {
      const response = await fetch('/api/active-game?gameType=tic-tac-toe');
      const data = await response.json();

      if (data.game) {
        // Load existing game
        setGameId(data.game.id);
        setBoard(JSON.parse(data.game.board));
        setCurrentPlayer(data.game.current_turn as 'X' | 'O');

        // Set player names from loaded game
        let names = { X: data.game.player_x, O: data.game.player_o };

        // If second player is joining (player O is "Waiting...")
        if (names.O === 'Waiting...' && userName && userName !== names.X) {
          names = { X: names.X, O: userName };
          setPlayerNames(names);
          setMyPlayer('O');
          // Update the game with the second player's name
          await saveGameState(data.game.id, JSON.parse(data.game.board), data.game.current_turn as 'X' | 'O', null, false, names);
        } else {
          setPlayerNames(names);

          // Determine which player this user is
          if (userName === names.X) {
            setMyPlayer('X');
          } else if (userName === names.O) {
            setMyPlayer('O');
          }
        }

        if (data.game.winner) {
          setWinner(data.game.winner as Player);
        }
        if (data.game.is_draw) {
          setIsDraw(true);
        }
      } else {
        // Create new game - first player is X
        if (userName) {
          const newGameId = Date.now().toString();
          setGameId(newGameId);
          setMyPlayer('X');
          const names = { X: userName, O: 'Waiting...' };
          setPlayerNames(names);
          await saveGameState(newGameId, Array(9).fill(null), 'X', null, false, names);
        }
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const syncGameState = async () => {
    try {
      const response = await fetch('/api/active-game?gameType=tic-tac-toe');
      const data = await response.json();

      if (data.game) {
        // If the game ID changed (e.g., new game started), update our local game ID
        if (data.game.id !== gameId) {
          setGameId(data.game.id);
        }

        const newBoard = JSON.parse(data.game.board);

        // Update player names if second player joined
        const names = { X: data.game.player_x, O: data.game.player_o };
        setPlayerNames(names);

        // Update myPlayer if it changed (second player joining)
        if (currentUserName === names.X) {
          setMyPlayer('X');
        } else if (currentUserName === names.O) {
          setMyPlayer('O');
        }

        // Convert winner name to player symbol (X or O)
        if (data.game.winner) {
          const winnerSymbol = data.game.winner === names.X ? 'X' : data.game.winner === names.O ? 'O' : null;
          if (winnerSymbol) {
            // Set board BEFORE setting winner to ensure the winning piece is visible
            setBoard(newBoard);
            setWinner(winnerSymbol);
            // Also calculate winning line
            const gameBoard = newBoard;
            for (const combo of WINNING_COMBINATIONS) {
              const [a, b, c] = combo;
              if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
                setWinningLine(combo);
                break;
              }
            }
          }
        } else {
          // Only update board and current player if no winner
          setBoard(newBoard);
          setCurrentPlayer(data.game.current_turn as 'X' | 'O');
        }

        if (data.game.is_draw) {
          setIsDraw(true);
        }

        // Check for new game requests
        if (data.game.new_game_requested_by) {
          setNewGameRequestedBy(data.game.new_game_requested_by);
        } else {
          setNewGameRequestedBy(null);
        }
      }
    } catch (error) {
      console.error('Error syncing game state:', error);
    }
  };

  const saveGameState = async (
    id: string,
    boardState: Board,
    turn: 'X' | 'O',
    winnerPlayer: Player,
    draw: boolean,
    names?: { X: string; O: string },
    requestNewGameBy?: string | null
  ) => {
    try {
      const playerNamesToUse = names || playerNames;
      await fetch('/api/active-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          gameType: 'tic-tac-toe',
          playerX: playerNamesToUse.X,
          playerO: playerNamesToUse.O,
          board: JSON.stringify(boardState),
          currentTurn: turn,
          winner: winnerPlayer ? playerNamesToUse[winnerPlayer] : null,
          isDraw: draw,
          newGameRequestedBy: requestNewGameBy !== undefined ? requestNewGameBy : newGameRequestedBy,
        }),
      });
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  const fetchGameStats = async () => {
    try {
      const response = await fetch('/api/game-stats?gameType=tic-tac-toe');
      if (response.ok) {
        const stats = await response.json();
        setAllTimeStats(stats);
      }
    } catch (error) {
      console.error('Error fetching game stats:', error);
    }
  };

  const saveGameResult = async (winner: Player, isDraw: boolean) => {
    try {
      const result = isDraw ? 'draw' : 'win';
      await fetch('/api/game-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: Date.now().toString(),
          gameType: 'tic-tac-toe',
          playerX: playerNames.X,
          playerO: playerNames.O,
          winner: winner ? playerNames[winner] : null,
          result,
        }),
      });
      // Refresh stats after saving
      fetchGameStats();
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  };

  const checkWinner = (newBoard: Board): Player => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        setWinningLine(combo);
        return newBoard[a];
      }
    }
    return null;
  };

  const handleCellClick = async (index: number) => {
    // Prevent move if:
    // 1. Cell is already filled
    // 2. Game is over
    // 3. It's not the player's turn
    if (board[index] || winner || isDraw) return;
    if (myPlayer !== currentPlayer) return; // Turn validation!

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (gameWinner) {
      setWinner(gameWinner);
      setScores(prev => ({ ...prev, [gameWinner]: prev[gameWinner] + 1 }));
      await saveGameState(gameId, newBoard, nextPlayer, gameWinner, false);
      saveGameResult(gameWinner, false);
      // Clear the game from active games after a delay
      setTimeout(async () => {
        await fetch(`/api/active-game?id=${gameId}`, { method: 'DELETE' });
      }, 3000);
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      await saveGameState(gameId, newBoard, nextPlayer, null, true);
      saveGameResult(null, true);
      // Clear the game from active games after a delay
      setTimeout(async () => {
        await fetch(`/api/active-game?id=${gameId}`, { method: 'DELETE' });
      }, 3000);
    } else {
      setCurrentPlayer(nextPlayer);
      await saveGameState(gameId, newBoard, nextPlayer, null, false);
    }
  };

  const handleStartNewGame = async () => {
    // If there's already a request from me, cancel it
    if (newGameRequestedBy === currentUserName) {
      await saveGameState(gameId, board, currentPlayer, winner, isDraw, undefined, null);
      setNewGameRequestedBy(null);
      return;
    }

    // If the other player requested, accept and start new game
    if (newGameRequestedBy && newGameRequestedBy !== currentUserName) {
      await acceptNewGameRequest();
      return;
    }

    // Otherwise, send a new game request
    await saveGameState(gameId, board, currentPlayer, winner, isDraw, undefined, currentUserName);
    setNewGameRequestedBy(currentUserName);
  };

  const acceptNewGameRequest = async () => {
    // Delete old game and create new one
    if (gameId) {
      await fetch(`/api/active-game?id=${gameId}`, { method: 'DELETE' });
    }

    // Reset local state
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    setNewGameRequestedBy(null);

    // Create new game
    const newGameId = Date.now().toString();
    setGameId(newGameId);
    await saveGameState(newGameId, Array(9).fill(null), 'X', null, false, undefined, null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Games</span>
          </Link>
          <h1 className="text-5xl font-bold text-slate-900 mb-2">
            Tic Tac Toe
          </h1>
          <p className="text-slate-600">Crosses vs Knots</p>
        </motion.div>

        {/* Current Session Score Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 p-6 mb-4"
        >
          <h3 className="text-sm font-medium text-slate-500 text-center mb-4">Current Session</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50">
              <div className="text-3xl mb-1 text-slate-800">
                <FontAwesomeIcon icon={faXmark} />
              </div>
              <div className="text-2xl font-bold text-slate-800">{scores['X']}</div>
              <div className="text-xs text-slate-500 font-medium">{playerNames.X || 'Player X'}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50">
              <div className="text-lg mb-1 text-slate-400">Draws</div>
              <div className="text-2xl font-bold text-slate-600">{scores.draws}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50">
              <div className="text-3xl mb-1 text-slate-800">
                <FontAwesomeIcon icon={faCircle} className="fa-regular" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{scores['O']}</div>
              <div className="text-xs text-slate-500 font-medium">{playerNames.O || 'Player O'}</div>
            </div>
          </div>
        </motion.div>

        {/* All-Time Stats */}
        {Object.keys(allTimeStats).length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 p-6 mb-8"
          >
            <h3 className="text-sm font-medium text-slate-500 text-center mb-4">All-Time Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(allTimeStats).map(([playerName, stats]) => (
                <div key={playerName} className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
                  <div className="text-center mb-3">
                    <div className="text-lg font-bold text-slate-900">{playerName}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Wins:</span>
                      <span className="font-semibold text-green-600">{stats.wins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Losses:</span>
                      <span className="font-semibold text-red-600">{stats.losses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Draws:</span>
                      <span className="font-semibold text-slate-600">{stats.draws}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200">
                      <span className="text-slate-700 font-medium">Total:</span>
                      <span className="font-bold text-slate-900">{stats.totalGames}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* New Game Request Notification */}
        {newGameRequestedBy && newGameRequestedBy !== currentUserName && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 border-2 border-blue-400 rounded-full shadow-lg">
              <span className="text-lg font-medium text-blue-900">
                {newGameRequestedBy} wants to start a new game
              </span>
            </div>
          </motion.div>
        )}

        {/* My Request Indicator */}
        {newGameRequestedBy === currentUserName && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-50 border-2 border-amber-400 rounded-full shadow-lg">
              <span className="text-lg font-medium text-amber-900">
                Waiting for opponent to accept...
              </span>
            </div>
          </motion.div>
        )}

        {/* Current Player Indicator */}
        {!winner && !isDraw && (
          <motion.div
            key={currentPlayer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-6"
          >
            <div className={`inline-flex items-center gap-3 px-6 py-3 backdrop-blur-sm rounded-full shadow-lg border-2 transition-all ${
              myPlayer === currentPlayer
                ? 'bg-green-50 border-green-400'
                : 'bg-white/80 border-slate-200'
            }`}>
              <span className="text-3xl text-slate-800">
                <FontAwesomeIcon icon={currentPlayer === 'X' ? faXmark : faCircle} />
              </span>
              <span className="text-lg font-medium text-slate-700">
                {myPlayer === currentPlayer
                  ? "Your turn!"
                  : `${playerNames[currentPlayer]}'s turn`}
              </span>
            </div>
          </motion.div>
        )}

        {/* Winner/Draw Announcement */}
        <AnimatePresence>
          {(winner || isDraw) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center mb-6"
            >
              <div className="inline-flex flex-col items-center gap-2 px-8 py-6 bg-white backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-slate-300">
                {winner ? (
                  <>
                    <div className="text-6xl mb-2 text-slate-800">
                      <FontAwesomeIcon icon={winner === 'X' ? faXmark : faCircle} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      Wins!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">🤝</div>
                    <div className="text-2xl font-bold text-slate-700">
                      It's a draw!
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 p-8 mb-6"
        >
          <div className="grid grid-cols-3 gap-4">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: cell ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(index)}
                className={`aspect-square rounded-2xl text-6xl font-bold text-slate-800 transition-all duration-300 ${
                  winningLine.includes(index)
                    ? 'bg-gradient-to-br from-slate-200 to-slate-300 shadow-lg scale-105'
                    : cell
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 shadow-md'
                    : 'bg-gradient-to-br from-slate-50 to-gray-100 hover:from-slate-100 hover:to-gray-200 shadow-md hover:shadow-xl'
                } ${!cell && !winner && !isDraw ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                disabled={!!cell || !!winner || isDraw}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: 360 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -360 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 15,
                        duration: 0.5
                      }}
                    >
                      <FontAwesomeIcon icon={cell === 'X' ? faXmark : faCircle} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Start New Game Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={handleStartNewGame}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all ${
              newGameRequestedBy && newGameRequestedBy !== currentUserName
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : newGameRequestedBy === currentUserName
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-slate-800 hover:bg-slate-900 text-white'
            }`}
          >
            <ArrowPathIcon className="w-5 h-5" />
            {newGameRequestedBy && newGameRequestedBy !== currentUserName
              ? 'Accept New Game'
              : newGameRequestedBy === currentUserName
              ? 'Cancel Request'
              : 'Start New Game'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
