'use client';

import { motion } from 'framer-motion';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface WelcomeBackProps {
  name: string;
  onComplete: () => void;
}

export default function WelcomeBack({ name, onComplete }: WelcomeBackProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <CheckCircleIcon className="w-12 h-12 text-emerald-500" />
      </motion.div>

      <div className="text-center">
        <p className="text-[#0f172a] font-bold text-base">Welcome back, {name}!</p>
        <p className="text-[#64748b] text-sm mt-0.5">Taking you in…</p>
      </div>

      {/* Progress bar — fires onComplete when done */}
      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.1, ease: 'linear' }}
          onAnimationComplete={onComplete}
        />
      </div>
    </div>
  );
}
