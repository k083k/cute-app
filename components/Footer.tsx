'use client';

import { GiftIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="glass-slate border-t border-slate-200 mt-auto backdrop-blur-lg bg-white/80">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-slate-700 text-sm flex items-center justify-center gap-2 font-medium">
            Made for you <GiftIcon className="h-4 w-4 text-slate-600" />
          </p>
          {mounted && (
            <p className="text-slate-500 text-xs mt-1">
              © {currentYear} • Keep pushing, you're doing amazing!
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
