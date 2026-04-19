'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/components/AuthProvider';

interface BibleVerse {
  reference: string;
  text: string;
  translation_id: string;
  translation_name: string;
}

export default function BiblePage() {
  const { user } = useAuth();
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchVerse();
  }, []);

  const fetchVerse = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('https://bible-api.com/data/web/random', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch verse');
      const data = await res.json();
      const v = data.random_verse;
      setVerse({
        reference: `${v.book} ${v.chapter}:${v.verse}`,
        text: v.text,
        translation_id: data.translation.identifier,
        translation_name: data.translation.name,
      });
      setIsFavorited(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 600);
    if (!isFavorited && verse) {
      const favorites = JSON.parse(localStorage.getItem('favoriteVerses') || '[]');
      favorites.push({ ...verse, savedAt: new Date().toISOString() });
      localStorage.setItem('favoriteVerses', JSON.stringify(favorites));
    }
  };

  const greeting = mounted ? (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })() : '';

  return (
    <div className="h-[calc(100dvh-4rem)] flex flex-col overflow-hidden relative">
      {/* Fixed beach bg — covers the full viewport so the nav glass frosts over it too */}
      <div className="fixed inset-0 -z-10 home-bg" />
      {/* Overlay — dark mode: subtle dark veil; light mode: slight white wash */}
      <div className="absolute inset-0 bg-black/30 dark:bg-black/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full px-4 sm:px-6 lg:px-8">

        {/* Greeting — sits over the sky */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-8 pb-4 text-center"
        >
          {mounted && (
            <p className="text-white/50 text-xs font-medium tracking-[0.18em] uppercase mb-2">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          )}
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            {greeting}{user?.name ? `, ${user.name}` : ''}
          </h1>
          <p className="text-white/50 text-sm mt-1.5 drop-shadow">
            Here&apos;s something for the two of you today.
          </p>
        </motion.div>

        {/* Verse — centered in remaining space */}
        <div className="flex-1 flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <motion.p
                  animate={{ opacity: [0.3, 0.9, 0.3] }}
                  transition={{ duration: 2.2, repeat: Infinity }}
                  className="text-white/60 text-sm drop-shadow"
                >
                  Finding the perfect verse…
                </motion.p>
                <div className="flex gap-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-white/50 rounded-full"
                      animate={{ y: [0, -7, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>

            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <p className="text-white/60 text-sm drop-shadow">Couldn&apos;t load a verse right now</p>
                <button
                  onClick={fetchVerse}
                  className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm border border-white/20 transition-all backdrop-blur-sm"
                >
                  Try again
                </button>
              </motion.div>

            ) : verse ? (
              <motion.div
                key="verse"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-xl"
              >
                {/* Verse card */}
                <div
                  className="relative rounded-3xl border border-white/[0.12] overflow-hidden"
                  style={{
                    background: 'rgba(0,0,0,0.38)',
                    backdropFilter: 'blur(18px)',
                    WebkitBackdropFilter: 'blur(18px)',
                    boxShadow: '0 8px 48px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                >
                  {/* Decorative quote mark */}
                  <span
                    className="absolute top-1 left-4 text-[6rem] leading-none font-serif select-none pointer-events-none"
                    style={{ color: 'rgba(255,255,255,0.06)' }}
                  >
                    &ldquo;
                  </span>

                  {/* Fav button */}
                  <motion.button
                    onClick={handleFavorite}
                    className="absolute top-3 right-3 p-2 rounded-full hover:bg-white/10 transition-colors z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {isFavorited ? (
                      <HeartSolidIcon className={`w-4 h-4 text-rose-400 ${showHeartAnimation ? 'animate-heart-beat' : ''}`} />
                    ) : (
                      <HeartIcon className="w-4 h-4 text-white/30 hover:text-white/60 transition-colors" />
                    )}
                  </motion.button>

                  <div className="relative z-10 px-7 md:px-10 pt-10 pb-6">
                    {/* Verse text */}
                    <blockquote className="text-base md:text-lg text-white/85 leading-relaxed text-center mb-6">
                      {verse.text.trim()}
                    </blockquote>

                    {/* Reference */}
                    <div className="border-t border-white/[0.08] pt-4 text-center">
                      <p className="text-white font-semibold">{verse.reference}</p>
                      <p className="text-white/30 text-xs mt-0.5 tracking-widest uppercase">{verse.translation_name}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Bottom — new verse button floats above the beach */}
        <div className="flex justify-center pb-8">
          <motion.button
            onClick={fetchVerse}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-white/55 hover:text-white border border-white/[0.15] hover:border-white/30 hover:bg-white/[0.08] transition-all group backdrop-blur-sm"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            <ArrowPathIcon className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            New verse
          </motion.button>
        </div>
      </div>
    </div>
  );
}
