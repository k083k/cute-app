'use client';

import { useState, useEffect, useRef } from 'react';
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

interface GameState {
  id: string;
  gameType: string;
  playerX: string;
  playerO: string;
  board: Board;
  currentTurn: 'X' | 'O';
  winner: string | null;
  isDraw: boolean;
  newGameRequestedBy: string | null;
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
  const [allTimeStats, setAllTimeStats] = useState<Record<string, GameStats>>({});
  const [gameId, setGameId] = useState<string>('');
  const [myPlayer, setMyPlayer] = useState<'X' | 'O' | null>(null);
  const [playerNames, setPlayerNames] = useState<{ X: string; O: string }>({ X: '', O: '' });
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [newGameRequestedBy, setNewGameRequestedBy] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    checkAuthAndInitialize();
    fetchGameStats();

    return () => {
      // Cleanup SSE connection on unmount
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    // Connect to SSE stream for real-time updates
    if (!currentUserName) return;

    const eventSource = new EventSource('/api/game-stream?gameType=tic-tac-toe');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE connection established');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'connected') {
          console.log('Connected to game stream');
        } else if (data.type === 'game-update' && data.game) {
          handleGameUpdate(data.game);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
      setIsConnected(false);
      eventSource.close();

      // Reconnect after 3 seconds
      setTimeout(() => {
        if (currentUserName) {
          console.log('Reconnecting to SSE...');
          // The next render will create a new connection
        }
      }, 3000);
    };

    return () => {
      eventSource.close();
    };
  }, [currentUserName]);

  const handleGameUpdate = (game: GameState) => {
    // If the game ID changed (e.g., new game started), reset game state
    if (game.id !== gameId) {
      setGameId(game.id);
      setWinner(null);
      setWinningLine([]);
      setIsDraw(false);
      setNewGameRequestedBy(null);
    }

    // Update player names
    const names = { X: game.playerX, O: game.playerO };
    setPlayerNames(names);

    // Update myPlayer if second player joins
    if (currentUserName === names.X) {
      setMyPlayer('X');
    } else if (currentUserName === names.O) {
      setMyPlayer('O');
    }

    // Update board state
    setBoard(game.board);
    setCurrentPlayer(game.currentTurn);

    // Handle winner
    if (game.winner) {
      const winnerSymbol = game.winner === names.X ? 'X' : game.winner === names.O ? 'O' : null;
      if (winnerSymbol && winner !== winnerSymbol) {
        setWinner(winnerSymbol);
        fetchGameStats();

        // Calculate winning line
        for (const combo of WINNING_COMBINATIONS) {
          const [a, b, c] = combo;
          if (game.board[a] && game.board[a] === game.board[b] && game.board[a] === game.board[c]) {
            setWinningLine(combo);
            break;
          }
        }
      }
    } else {
      setWinner(null);
      setWinningLine([]);
    }

    // Handle draw
    if (game.isDraw && !isDraw) {
      setIsDraw(true);
      fetchGameStats();
    } else if (!game.isDraw) {
      setIsDraw(false);
    }

    // Handle new game requests
    setNewGameRequestedBy(game.newGameRequestedBy);
  };

  const checkAuthAndInitialize = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (data.isAuthenticated && data.user) {
        setCurrentUserName(data.user.name);
      }

      // Load existing game or create new one
      await loadOrCreateGame(data.user?.name);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const loadOrCreateGame = async (userName?: string) => {
    try {
      const response = await fetch('/api/game-action?gameType=tic-tac-toe');
      const data = await response.json();

      if (data.game) {
        // Load existing game
        setGameId(data.game.id);
        setBoard(data.game.board);
        setCurrentPlayer(data.game.currentTurn);

        const names = { X: data.game.playerX, O: data.game.playerO };

        // If second player is joining (player O is "Waiting...")
        if (names.O === 'Waiting...' && userName && userName !== names.X) {
          names.O = userName;
          setPlayerNames(names);
          setMyPlayer('O');
          // Update the game with the second player's name
          await saveGameState(data.game.id, data.game.board, data.game.currentTurn, null, false, names);
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
          const winnerSymbol = data.game.winner === names.X ? 'X' : 'O';
          setWinner(winnerSymbol as Player);
        }
        if (data.game.isDraw) {
          setIsDraw(true);
        }
        if (data.game.newGameRequestedBy) {
          setNewGameRequestedBy(data.game.newGameRequestedBy);
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
      await fetch('/api/game-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          gameType: 'tic-tac-toe',
          playerX: playerNamesToUse.X,
          playerO: playerNamesToUse.O,
          board: boardState,
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
    if (myPlayer !== currentPlayer) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;

    // Optimistic UI update
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (gameWinner) {
      setWinner(gameWinner);
      await saveGameState(gameId, newBoard, nextPlayer, gameWinner, false);
      // Clear the game from active games after a delay
      setTimeout(async () => {
        await fetch(`/api/game-action?id=${gameId}`, { method: 'DELETE' });
      }, 3000);
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      await saveGameState(gameId, newBoard, nextPlayer, null, true);
      // Clear the game from active games after a delay
      setTimeout(async () => {
        await fetch(`/api/game-action?id=${gameId}`, { method: 'DELETE' });
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
      await fetch(`/api/game-action?id=${gameId}`, { method: 'DELETE' });
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
          {/* Connection indicator */}
          <div className="mt-2 text-xs text-slate-500">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            {isConnected ? 'Connected' : 'Reconnecting...'}
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
                      {playerNames[winner]} Wins!
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
                } ${!cell && !winner && !isDraw && myPlayer === currentPlayer ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                disabled={!!cell || !!winner || isDraw || myPlayer !== currentPlayer}
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
