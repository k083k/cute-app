'use client';

import { motion } from 'framer-motion';

export default function ErrorMsg({ text }: { text: string }) {
  if (!text) return null;
  return (
    <motion.p
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs text-red-500 dark:text-red-400 px-1"
      role="alert"
    >
      {text}
    </motion.p>
  );
}
