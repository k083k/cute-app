import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FALLBACK_QUOTES = [
  {
    q: 'The future depends on what you do today.',
    a: 'Mahatma Gandhi',
  },
  {
    q: 'Success usually comes to those who are too busy to be looking for it.',
    a: 'Henry David Thoreau',
  },
  {
    q: 'The best way to predict the future is to create it.',
    a: 'Peter Drucker',
  },
  {
    q: "Do not wait; the time will never be 'just right.' Start where you stand.",
    a: 'Napoleon Hill',
  },
  {
    q: 'It always seems impossible until it is done.',
    a: 'Nelson Mandela',
  },
];

const buildHtml = (quote: { q: string; a: string }) =>
  `<blockquote>&ldquo;${quote.q}&rdquo; &mdash; <footer>${quote.a}</footer></blockquote>`;

const getFallbackQuote = () =>
  FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];

export async function GET() {
  try {
    // Using quotable API - simple random quote
    const response = await fetch('https://motivational-spark-api.vercel.app/api/quotes/random', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', response.status, errorText);
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    // Transform to match our expected format
    return NextResponse.json({
      q: data.quote,
      a: data.author,
      h: `<blockquote>&ldquo;${data.quote}&rdquo; &mdash; <footer>${data.author}</footer></blockquote>`
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Return a fallback quote instead of an error
    const fallback = getFallbackQuote();
    return NextResponse.json({
      ...fallback,
      h: buildHtml(fallback),
    }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
