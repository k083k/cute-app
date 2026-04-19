'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
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
  const [reconnectAttempt, setReconnectAttempt] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Use refs for values needed inside SSE callback to avoid stale closures
  const gameIdRef = useRef(gameId);
  const winnerRef = useRef(winner);
  const isDraw_Ref = useRef(isDraw);

  useEffect(() => { gameIdRef.current = gameId; }, [gameId]);
  useEffect(() => { winnerRef.current = winner; }, [winner]);
  useEffect(() => { isDraw_Ref.current = isDraw; }, [isDraw]);

  const fetchGameStats = useCallback(async () => {
    try {
      const response = await fetch('/api/game-stats?gameType=tic-tac-toe');
      if (response.ok) {
        const stats = await response.json();
        setAllTimeStats(stats);
      }
    } catch {
      // Stats are non-critical; silently ignore
    }
  }, []);

  useEffect(() => {
    checkAuthAndInitialize();
    fetchGameStats();

    return () => {
      eventSourceRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!currentUserName) return;

    const eventSource = new EventSource('/api/game-stream?gameType=tic-tac-toe');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'game-update' && data.game) {
          handleGameUpdate(data.game);
        }
      } catch {
        // Malformed SSE message; skip
      }
    };

    eventSource.onerror = () => {
      setIsConnected(false);
      eventSource.close();
      // Trigger reconnect after 3s by incrementing the counter
      setTimeout(() => setReconnectAttempt((n) => n + 1), 3000);
    };

    return () => {
      eventSource.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserName, reconnectAttempt]);

  const handleGameUpdate = (game: GameState) => {
    if (game.id !== gameIdRef.current) {
      setGameId(game.id);
      setWinner(null);
      setWinningLine([]);
      setIsDraw(false);
      setNewGameRequestedBy(null);
    }

    const names = { X: game.playerX, O: game.playerO };
    setPlayerNames(names);

    setCurrentUserName((prev) => {
      if (prev === names.X) setMyPlayer('X');
      else if (prev === names.O) setMyPlayer('O');
      return prev;
    });

    setBoard(game.board);
    setCurrentPlayer(game.currentTurn);

    if (game.winner) {
      const winnerSymbol = game.winner === names.X ? 'X' : game.winner === names.O ? 'O' : null;
      if (winnerSymbol && winnerRef.current !== winnerSymbol) {
        setWinner(winnerSymbol);
        fetchGameStats();

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

    if (game.isDraw && !isDraw_Ref.current) {
      setIsDraw(true);
      fetchGameStats();
    } else if (!game.isDraw) {
      setIsDraw(false);
    }

    setNewGameRequestedBy(game.newGameRequestedBy);
  };

  const checkAuthAndInitialize = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();

      if (data.isAuthenticated && data.user) {
        setCurrentUserName(data.user.name);
      }

      await loadOrCreateGame(data.user?.name);
    } catch {
      // Auth check failed silently
    }
  };

  const loadOrCreateGame = async (userName?: string) => {
    try {
      const response = await fetch('/api/game-action?gameType=tic-tac-toe');
      const data = await response.json();

      if (data.game) {
        setGameId(data.game.id);
        setBoard(data.game.board);
        setCurrentPlayer(data.game.currentTurn);

        const names = { X: data.game.playerX, O: data.game.playerO };

        if (names.O === 'Waiting...' && userName && userName !== names.X) {
          names.O = userName;
          setPlayerNames(names);
          setMyPlayer('O');
          await saveGameState(data.game.id, data.game.board, data.game.currentTurn, null, false, names);
        } else {
          setPlayerNames(names);
          if (userName === names.X) setMyPlayer('X');
          else if (userName === names.O) setMyPlayer('O');
        }

        if (data.game.winner) {
          const winnerSymbol = data.game.winner === names.X ? 'X' : 'O';
          setWinner(winnerSymbol as Player);
        }
        if (data.game.isDraw) setIsDraw(true);
        if (data.game.newGameRequestedBy) setNewGameRequestedBy(data.game.newGameRequestedBy);
      } else {
        if (userName) {
          const newGameId = Date.now().toString();
          setGameId(newGameId);
          setMyPlayer('X');
          const names = { X: userName, O: 'Waiting...' };
          setPlayerNames(names);
          await saveGameState(newGameId, Array(9).fill(null), 'X', null, false, names);
        }
      }
    } catch {
      // Game load failed silently
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
    if (board[index] || winner || isDraw) return;
    if (myPlayer !== currentPlayer) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';

    if (gameWinner) {
      setWinner(gameWinner);
      await saveGameState(gameId, newBoard, nextPlayer, gameWinner, false);
      setTimeout(async () => {
        await fetch(`/api/game-action?id=${gameId}`, { method: 'DELETE' });
      }, 3000);
    } else if (newBoard.every((cell) => cell !== null)) {
      setIsDraw(true);
      await saveGameState(gameId, newBoard, nextPlayer, null, true);
      setTimeout(async () => {
        await fetch(`/api/game-action?id=${gameId}`, { method: 'DELETE' });
      }, 3000);
    } else {
      setCurrentPlayer(nextPlayer);
      await saveGameState(gameId, newBoard, nextPlayer, null, false);
    }
  };

  const handleStartNewGame = async () => {
    if (newGameRequestedBy === currentUserName) {
      await saveGameState(gameId, board, currentPlayer, winner, isDraw, undefined, null);
      setNewGameRequestedBy(null);
      return;
    }

    if (newGameRequestedBy && newGameRequestedBy !== currentUserName) {
      await acceptNewGameRequest();
      return;
    }

    await saveGameState(gameId, board, currentPlayer, winner, isDraw, undefined, currentUserName);
    setNewGameRequestedBy(currentUserName);
  };

  const acceptNewGameRequest = async () => {
    if (gameId) {
      await fetch(`/api/game-action?id=${gameId}`, { method: 'DELETE' });
    }

    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
    setNewGameRequestedBy(null);

    const newGameId = Date.now().toString();
    setGameId(newGameId);
    await saveGameState(newGameId, Array(9).fill(null), 'X', null, false, undefined, null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Games</span>
          </Link>
          <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-2">Tic Tac Toe</h1>
          <p className="text-slate-600 dark:text-slate-400">Crosses vs Knots</p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-400 animate-pulse'
              }`}
            />
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </div>
        </motion.div>

        {/* All-Time Stats */}
        {Object.keys(allTimeStats).length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 mb-8"
          >
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center mb-4">
              All-Time Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(allTimeStats).map(([playerName, stats]) => (
                <div
                  key={playerName}
                  className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600"
                >
                  <div className="text-center mb-3">
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{playerName}</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Wins:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">{stats.wins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Losses:</span>
                      <span className="font-semibold text-red-600 dark:text-red-400">{stats.losses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Draws:</span>
                      <span className="font-semibold text-slate-600 dark:text-slate-400">{stats.draws}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Total:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{stats.totalGames}</span>
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
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-400 dark:border-blue-600 rounded-full shadow-lg">
              <span className="text-lg font-medium text-blue-900 dark:text-blue-300">
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
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-full shadow-lg">
              <span className="text-lg font-medium text-amber-900 dark:text-amber-300">
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
            <div
              className={`inline-flex items-center gap-3 px-6 py-3 backdrop-blur-sm rounded-full shadow-lg border-2 transition-all ${
                myPlayer === currentPlayer
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-400 dark:border-green-600'
                  : 'bg-white/80 dark:bg-slate-800/80 border-slate-200 dark:border-slate-600'
              }`}
            >
              <span className="text-3xl text-slate-800 dark:text-slate-200">
                <FontAwesomeIcon icon={currentPlayer === 'X' ? faXmark : faCircle} />
              </span>
              <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
                {myPlayer === currentPlayer ? 'Your turn!' : `${playerNames[currentPlayer]}'s turn`}
              </span>
            </div>
          </motion.div>
        )}

        {/* Winner / Draw Announcement */}
        <AnimatePresence>
          {(winner || isDraw) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center mb-6"
            >
              <div className="inline-flex flex-col items-center gap-2 px-8 py-6 bg-white dark:bg-slate-800 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-slate-300 dark:border-slate-600">
                {winner ? (
                  <>
                    <div className="text-6xl mb-2 text-slate-800 dark:text-slate-200">
                      <FontAwesomeIcon icon={winner === 'X' ? faXmark : faCircle} />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {playerNames[winner]} Wins!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-4xl mb-2">🤝</div>
                    <div className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                      It&apos;s a draw!
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
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8 mb-6"
        >
          <div className="grid grid-cols-3 gap-4">
            {board.map((cell, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: cell ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(index)}
                className={`aspect-square rounded-2xl text-6xl font-bold transition-all duration-300 ${
                  winningLine.includes(index)
                    ? 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500 shadow-lg scale-105 text-slate-900 dark:text-white'
                    : cell
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 shadow-md text-slate-800 dark:text-slate-200'
                    : 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-700/50 dark:to-slate-600/50 hover:from-slate-100 hover:to-gray-200 dark:hover:from-slate-600 dark:hover:to-slate-500 shadow-md hover:shadow-xl text-slate-800 dark:text-slate-200'
                } ${
                  !cell && !winner && !isDraw && myPlayer === currentPlayer
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed'
                }`}
                disabled={!!cell || !!winner || isDraw || myPlayer !== currentPlayer}
                aria-label={`Cell ${index + 1}${cell ? `, played ${cell}` : ''}`}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: 360 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: -360 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.5 }}
                    >
                      <FontAwesomeIcon icon={cell === 'X' ? faXmark : faCircle} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* New Game Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={handleStartNewGame}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all ${
              newGameRequestedBy && newGameRequestedBy !== currentUserName
                ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white'
                : newGameRequestedBy === currentUserName
                ? 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600 text-white'
                : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-200 dark:hover:bg-white dark:text-slate-900 text-white'
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
