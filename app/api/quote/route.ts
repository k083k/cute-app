import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Using quotable API - simple random quote
    const response = await fetch('https://api.quotable.io/random', {
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
      q: data.content,
      a: data.author,
      h: `<blockquote>&ldquo;${data.content}&rdquo; &mdash; <footer>${data.author}</footer></blockquote>`
    });
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Return a fallback quote instead of an error
    return NextResponse.json({
      q: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      a: "Winston Churchill",
      h: `<blockquote>&ldquo;Success is not final, failure is not fatal: it is the courage to continue that counts.&rdquo; &mdash; <footer>Winston Churchill</footer></blockquote>`
    });
  }
}
