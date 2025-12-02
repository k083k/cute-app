'use client';

import { useEffect, useState } from 'react';

interface Quote {
  q: string;
  a: string;
  h: string;
}

export default function MotivationPage() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-purple-600 text-xl">Loading your motivation...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 text-xl mb-4">Error loading quote</div>
        <button
          onClick={fetchDailyMotivation}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
          Daily Motivation
        </h1>
        <p className="text-gray-600 text-lg">
          Keep pushing through law school - you've got this!
        </p>
      </div>

      {/* Main Quote Card */}
      <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 mb-8 border-l-4 border-black">
        {quote && (
          <>
            <div className="mb-8">
              <svg
                className="w-12 h-12 text-gray-300 mb-4"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <blockquote className="text-2xl md:text-3xl text-gray-900 leading-relaxed mb-6">
                {quote.q}
              </blockquote>
              <p className="text-lg text-black font-semibold">
                — {quote.a}
              </p>
            </div>
          </>
        )}

        <button
          onClick={fetchDailyMotivation}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-all font-semibold"
        >
          Get Another Quote
        </button>
      </div>

      {/* Encouraging Messages for Law School */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-bold text-black mb-3">Remember:</h3>
          <p className="text-gray-700">
            Every case you read, every brief you write, every class you attend is building the foundation for your amazing future as a lawyer.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-bold text-black mb-3">You're Capable:</h3>
          <p className="text-gray-700">
            Law school is tough, but so are you. You were chosen because you have what it takes to succeed. Trust the process.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-bold text-black mb-3">Take Breaks:</h3>
          <p className="text-gray-700">
            Don't forget to breathe, rest, and take care of yourself. Your mental health matters just as much as your grades.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md">
          <h3 className="text-xl font-bold text-black mb-3">You're Not Alone:</h3>
          <p className="text-gray-700">
            Everyone in law school feels overwhelmed sometimes. Reach out, ask for help, and remember there are people who believe in you.
          </p>
        </div>
      </div>

      {/* Attribution */}
      <div className="text-center text-sm text-white">
        <p>Quotes provided by <a href="https://quotable.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Quotable API</a></p>
      </div>
    </div>
  );
}
