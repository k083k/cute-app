'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import HeroSection from '@/components/HeroSection';

interface BibleVerse {
  reference: string;
  text: string;
  translation_id: string;
  translation_name: string;
  translation_language?: string;
}

export default function BiblePage() {
  const [verse, setVerse] = useState<BibleVerse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchDailyVerse();
  }, []);

  const fetchDailyVerse = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('https://bible-api.com/data/web/random', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch verse');
      }

      const data = await response.json();
      const randomVerse = data.random_verse;

      setVerse({
        reference: `${randomVerse.book} ${randomVerse.chapter}:${randomVerse.verse}`,
        text: randomVerse.text,
        translation_id: data.translation.identifier,
        translation_name: data.translation.name,
        translation_language: data.translation.language,
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

    // Store in localStorage
    if (!isFavorited && verse) {
      const favorites = JSON.parse(localStorage.getItem('favoriteVerses') || '[]');
      favorites.push({
        ...verse,
        savedAt: new Date().toISOString(),
      });
      localStorage.setItem('favoriteVerses', JSON.stringify(favorites));
    }
  };

  if (loading) {
    return (
      <>
        <HeroSection />
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-slate-600 text-xl mb-4"
          >
            Finding the perfect verse for you...
          </motion.div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-slate-400 rounded-full"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <HeroSection />
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-slate-600 text-xl mb-4">Oops! Something went wrong</div>
          <button
            onClick={fetchDailyVerse}
            className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all transform hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <HeroSection />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center justify-center px-4 pb-12"
      >
        <div className="glass-slate rounded-2xl shadow-slate p-8 md:p-12 max-w-3xl w-full relative border border-slate-200">
          {/* Favorite button */}
          <motion.button
            onClick={handleFavorite}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
              isFavorited ? 'bg-slate-100' : 'bg-white/50 hover:bg-white/80'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isFavorited ? (
              <HeartSolidIcon className={`w-6 h-6 text-slate-700 ${showHeartAnimation ? 'animate-heart-beat' : ''}`} />
            ) : (
              <HeartIcon className="w-6 h-6 text-slate-400" />
            )}
          </motion.button>

          <div className="text-center mb-6">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
              Today's Verse
            </h2>
            {mounted && (
              <p className="text-slate-500 text-sm">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}
          </div>

          {verse && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="relative mb-8">
                <svg className="absolute -left-4 -top-4 h-8 w-8 text-slate-200" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <blockquote className="text-xl md:text-2xl text-slate-800 leading-relaxed text-center px-8">
                  {verse.text.trim()}
                </blockquote>
              </div>
              <div className="text-center border-t border-slate-200 pt-6">
                <p className="text-xl md:text-2xl font-bold text-slate-900 mb-1">
                  {verse.reference}
                </p>
                <p className="text-sm text-slate-500">
                  {verse.translation_name}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <motion.button
          onClick={fetchDailyVerse}
          className="mt-8 px-8 py-3 bg-slate-800 text-white rounded-full hover:bg-slate-900 hover:shadow-lg transition-all font-medium flex items-center gap-2 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
          Get New Verse
        </motion.button>
      </motion.div>
    </>
  );
}
