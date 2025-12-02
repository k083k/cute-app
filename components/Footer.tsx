'use client';

import { HeartIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

export default function Footer() {
  const [mounted, setMounted] = useState(false);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <footer className="bg-black border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
            Made with <HeartIcon className="h-4 w-4 text-gray-500" /> for you
          </p>
          {mounted && (
            <p className="text-gray-600 text-xs mt-1">
              © {currentYear} • Keep pushing, you're doing amazing!
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
