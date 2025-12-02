'use client';

import { useEffect, useState } from 'react';

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-purple-600 text-xl">Loading today's verse...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-xl mb-4">Error loading verse</div>
        <button
          onClick={fetchDailyVerse}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 max-w-3xl w-full border-l-4 border-black">
        <div className="text-center mb-6">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
            Today's Verse
          </h2>
          {mounted && (
            <p className="text-gray-500 text-sm">
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
          <>
            <div className="relative">
              <svg className="absolute -left-4 -top-4 h-8 w-8 text-gray-200" fill="currentColor" viewBox="0 0 32 32">
                <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
              </svg>
              <blockquote className="text-xl md:text-2xl text-gray-900 leading-relaxed mb-6 italic text-center px-8">
                {verse.text.trim()}
              </blockquote>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-black">
                {verse.reference}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {verse.translation_name}
              </p>
            </div>
          </>
        )}
      </div>

      <button
        onClick={fetchDailyVerse}
        className="mt-6 px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-all text-sm font-medium"
      >
        Get New Verse
      </button>
    </div>
  );
}
