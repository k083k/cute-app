'use client';

import { motion } from 'framer-motion';
import { PuzzlePieceIcon } from '@heroicons/react/24/outline';

const upcoming = [
  { name: 'Tic Tac Toe', desc: 'Classic two-player board game.' },
  { name: 'Memory Match', desc: 'Flip cards and find the pairs.' },
];

export default function GamesPage() {
  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none home-bg">
        <div className="absolute inset-0 bg-black/30 dark:bg-black/40" />
      </div>

      <div className="h-[calc(100dvh-4rem)] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm text-center"
        >
          <PuzzlePieceIcon className="w-10 h-10 text-white/20 mx-auto mb-5" />
          <h1 className="text-xl font-semibold text-white/80 mb-1">Games</h1>
          <p className="text-sm text-white/35 mb-8">Coming soon.</p>

          <div className="flex flex-col gap-3">
            {upcoming.map((game, i) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + i * 0.08 }}
                className="rounded-2xl px-5 py-4 text-left"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <p className="text-white/60 text-sm font-medium">{game.name}</p>
                <p className="text-white/25 text-xs mt-0.5">{game.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
