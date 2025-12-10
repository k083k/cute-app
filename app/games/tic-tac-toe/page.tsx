'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowPathIcon, HomeIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Player = '❤️' | '⭐' | null;
type Board = Player[];

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

export default function TicTacToePage() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'❤️' | '⭐'>('❤️');
  const [winner, setWinner] = useState<Player>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [isDraw, setIsDraw] = useState(false);
  const [scores, setScores] = useState({ '❤️': 0, '⭐': 0, draws: 0 });

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
    } else if (newBoard.every(cell => cell !== null)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    } else {
      setCurrentPlayer(currentPlayer === '❤️' ? '⭐' : '❤️');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('❤️');
    setWinner(null);
    setWinningLine([]);
    setIsDraw(false);
  };

  const resetScores = () => {
    setScores({ '❤️': 0, '⭐': 0, draws: 0 });
    resetGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link
            href="/games"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors mb-4"
          >
            <HomeIcon className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Games</span>
          </Link>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Tic Tac Toe
          </h1>
          <p className="text-slate-600">Hearts vs Stars</p>
        </motion.div>

        {/* Score Board */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-violet-200 p-6 mb-8"
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-100 to-pink-50">
              <div className="text-3xl mb-1">❤️</div>
              <div className="text-2xl font-bold text-pink-600">{scores['❤️']}</div>
              <div className="text-xs text-pink-600/60 font-medium">Hearts</div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50">
              <div className="text-lg mb-1 text-slate-400">Draws</div>
              <div className="text-2xl font-bold text-slate-600">{scores.draws}</div>
            </div>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50">
              <div className="text-3xl mb-1">⭐</div>
              <div className="text-2xl font-bold text-violet-600">{scores['⭐']}</div>
              <div className="text-xs text-violet-600/60 font-medium">Stars</div>
            </div>
          </div>
        </motion.div>

        {/* Current Player Indicator */}
        {!winner && !isDraw && (
          <motion.div
            key={currentPlayer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center mb-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-violet-200">
              <span className="text-3xl">{currentPlayer}</span>
              <span className="text-lg font-medium text-slate-700">
                {currentPlayer === '❤️' ? "Heart's turn" : "Star's turn"}
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
              <div className="inline-flex flex-col items-center gap-2 px-8 py-6 bg-gradient-to-br from-white to-violet-50 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-violet-300">
                {winner ? (
                  <>
                    <div className="text-6xl mb-2">{winner}</div>
                    <div className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
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
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-violet-200 p-8 mb-6"
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
                    ? 'bg-gradient-to-br from-violet-200 to-purple-200 shadow-lg scale-105'
                    : cell
                    ? 'bg-gradient-to-br from-slate-50 to-slate-100 shadow-md'
                    : 'bg-gradient-to-br from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 shadow-md hover:shadow-xl'
                } ${!cell && !winner && !isDraw ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                disabled={!!cell || !!winner || isDraw}
              >
                <AnimatePresence mode="wait">
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                    >
                      {cell}
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
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <ArrowPathIcon className="w-5 h-5" />
            New Game
          </button>
          <button
            onClick={resetScores}
            className="px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-full font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all border border-violet-200"
          >
            Reset Scores
          </button>
        </motion.div>
      </div>
    </div>
  );
}
