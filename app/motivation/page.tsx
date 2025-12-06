'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowPathIcon, HeartIcon, SparklesIcon, LightBulbIcon, FaceSmileIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Confetti from '@/components/Confetti';

interface Quote {
  q: string;
  a: string;
  h: string;
}

export default function MotivationPage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchDailyMotivation();
  }, []);

  const fetchDailyMotivation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Using our API route which proxies to Quotable API
      const response = await fetch('/api/quote');

      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();
      setQuote(data);
      setIsFavorited(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    if (!isFavorited) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 100);

      // Store in localStorage
      if (quote) {
        const favorites = JSON.parse(localStorage.getItem('favoriteQuotes') || '[]');
        favorites.push({
          ...quote,
          savedAt: new Date().toISOString(),
        });
        localStorage.setItem('favoriteQuotes', JSON.stringify(favorites));
      }
    }
  };

  const encouragementCards = [
    {
      icon: SparklesIcon,
      title: 'Remember:',
      message: 'Every case you read, every brief you write, every class you attend is building the foundation for your amazing future as a lawyer.',
      color: 'bg-slate-700',
      bgColor: 'glass-slate',
    },
    {
      icon: HandThumbUpIcon,
      title: "You're Capable:",
      message: 'Law school is tough, but so are you. You were chosen because you have what it takes to succeed. Trust the process.',
      color: 'bg-slate-600',
      bgColor: 'glass-slate',
    },
    {
      icon: FaceSmileIcon,
      title: 'Take Breaks:',
      message: "Don't forget to breathe, rest, and take care of yourself. Your mental health matters just as much as your grades.",
      color: 'bg-stone-600',
      bgColor: 'glass-stone',
    },
    {
      icon: LightBulbIcon,
      title: "You're Not Alone:",
      message: 'Everyone in law school feels overwhelmed sometimes. Reach out, ask for help, and remember there are people who believe in you.',
      color: 'bg-slate-700',
      bgColor: 'glass-slate',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
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
          Finding inspiration for you...
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
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-slate-600 text-xl mb-4">Oops! Something went wrong</div>
        <button
          onClick={fetchDailyMotivation}
          className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-3 rounded-full hover:shadow-lg transition-all transform hover:scale-105"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <Confetti trigger={showConfetti} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Daily Motivation
          </h1>
          <p className="text-slate-600 text-lg">
            Keep pushing through law school - you've got this!
          </p>
        </motion.div>

        {/* Main Quote Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="glass-slate rounded-2xl shadow-slate p-8 md:p-12 mb-8 relative border border-slate-200"
        >
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
              <HeartSolidIcon className="w-6 h-6 text-slate-700" />
            ) : (
              <HeartIcon className="w-6 h-6 text-slate-400" />
            )}
          </motion.button>

          {quote && (
            <div className="mb-8">
              <svg
                className="w-12 h-12 text-slate-200 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="text-2xl md:text-3xl text-slate-900 leading-relaxed mb-6">
                {quote.q}
              </blockquote>
              <p className="text-lg font-semibold text-slate-700">
                — {quote.a}
              </p>
            </div>
          )}

          <motion.button
            onClick={fetchDailyMotivation}
            className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-full hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowPathIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            Get Another Quote
          </motion.button>
        </motion.div>

        {/* Encouraging Messages for Law School */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {encouragementCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                className={`${card.bgColor} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {card.title}
                  </h3>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  {card.message}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Attribution */}
        <div className="text-center text-sm text-white">
          <p>Quotes provided by <a href="https://quotable.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700">Quotable API</a></p>
        </div>
      </div>
    </>
  );
}
