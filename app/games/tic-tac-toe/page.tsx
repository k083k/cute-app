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

const PLAYER_NAMES = {
  'X': 'Ansaa',
  'O': 'Kwabena'
};

export default function TicTacToePage() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ 'X': 0, 'O': 0, draws: 0 });
  const [allTimeStats, setAllTimeStats] = useState<Record<string, GameStats>>({});

  useEffect(() => {
    fetchGameStats();
  }, []);

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
          playerX: PLAYER_NAMES['X'],
          playerO: PLAYER_NAMES['O'],
          winner: winner ? PLAYER_NAMES[winner] : null,
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

  const handleCellClick = (index: number) => {
    if (board[index] || winner || isDraw) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameWinner = checkWinner(newBoard);
    if (gameWinner) {
      setWinner(gameWinner);
      setScores(prev => ({ ...prev, [gameWinner]: prev[gameWinner] + 1 }));
      saveGameResult(gameWinner, false);
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      saveGameResult(null, true);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
  };

  const resetScores = () => {
    setScores({ 'X': 0, 'O': 0, draws: 0 });
    resetGame();
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
              <div className="text-xs text-slate-500 font-medium">{PLAYER_NAMES['X']}</div>
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
              <div className="text-xs text-slate-500 font-medium">{PLAYER_NAMES['O']}</div>
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

        {/* Current Player Indicator */}
        {!winner && !isDraw && (
          <motion.div
            key={currentPlayer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-slate-200">
              <span className="text-3xl text-slate-800">
                <FontAwesomeIcon icon={currentPlayer === 'X' ? faXmark : faCircle} />
              </span>
              <span className="text-lg font-medium text-slate-700">
                {currentPlayer === 'X' ? "Cross's turn" : "Knot's turn"}
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

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex gap-4 justify-center"
        >
          <button
            onClick={resetGame}
            className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 hover:bg-slate-900 transition-all"
          >
            <ArrowPathIcon className="w-5 h-5" />
            New Game
          </button>
          <button
            onClick={resetScores}
            className="px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-slate-200"
          >
            Reset Scores
          </button>
        </motion.div>
      </div>
    </div>
  );
}
