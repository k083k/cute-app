'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { XMarkIcon, CircleStackIcon } from '@heroicons/react/24/outline';

const games = [
  {
    id: 'tic-tac-toe',
    name: 'Tic Tac Toe',
    description: 'Classic strategy game for two players',
    icon: XMarkIcon,
    gradient: 'from-slate-200 to-slate-300 dark:from-slate-600 dark:to-slate-500',
    available: true,
  },
  {
    id: 'memory',
    name: 'Memory Match',
    description: 'Find matching pairs of cards',
    icon: CircleStackIcon,
    gradient: 'from-slate-200 to-gray-300 dark:from-slate-600 dark:to-slate-500',
    available: false,
  },
];

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4">
            Games
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Play together, have fun, and create memories
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {games.map((game, index) => {
            const Icon = game.icon;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <Link
                  href={game.available ? `/games/${game.id}` : '#'}
                  className={`block ${!game.available && 'pointer-events-none'}`}
                  aria-disabled={!game.available}
                >
                  <div
                    className={`relative overflow-hidden rounded-3xl bg-white dark:bg-slate-800 p-8 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-300 ${
                      game.available
                        ? 'hover:shadow-2xl hover:scale-105 hover:border-slate-300 dark:hover:border-slate-600'
                        : 'opacity-60'
                    }`}
                  >
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${game.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
                    />

                    <div
                      className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${game.gradient} mb-6 shadow-md`}
                    >
                      <Icon className="w-8 h-8 text-slate-700 dark:text-slate-200" />
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {game.name}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">{game.description}</p>

                    {game.available ? (
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                        Play now
                        <svg
                          className="w-4 h-4 transition-transform group-hover:translate-x-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 dark:text-slate-500">
                        Coming soon
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-16"
        >
          <p className="text-slate-500 dark:text-slate-600 text-sm">More games coming soon...</p>
        </motion.div>
      </div>
    </div>
  );
}
