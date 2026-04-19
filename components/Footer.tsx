'use client';

import { useState, useEffect } from 'react';
import { SILHOUETTES } from './auth/constants';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <footer className="mt-auto">
      <svg
        className="w-full block pointer-events-none"
        viewBox="0 0 400 56"
        preserveAspectRatio="none"
        style={{ height: '48px', marginBottom: '-2px' }}
      >
        <path d={SILHOUETTES[1]} fill="rgba(8,3,24,0.85)" />
      </svg>

      <div className="bg-[#080318]/90 backdrop-blur-xl border-t border-white/[0.06] px-4 py-4">
        <div className="max-w-7xl mx-auto text-center">
          {mounted && (
            <p className="text-white/25 text-xs tracking-wide">
              © {new Date().getFullYear()} Daily Encouragement
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
