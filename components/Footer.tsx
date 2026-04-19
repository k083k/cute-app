'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <footer className="mt-auto">
      <div className="bg-[#080318]/90 backdrop-blur-xl border-t border-white/6 px-4 py-4">
        <div className="max-w-7xl mx-auto text-center">
          {mounted && (
            <p className="text-white/25 text-xs tracking-wide">
              © {new Date().getFullYear()}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
