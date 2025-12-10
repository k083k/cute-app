import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This proxy will block all bots and crawlers
export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';

  // List of known bot user agents
  const botPatterns = [
    'bot', 'crawl', 'spider', 'slurp', 'baiduspider', 'yandex',
    'facebookexternalhit', 'whatsapp', 'telegram', 'discord',
    'lighthouse', 'gtmetrix', 'pagespeed', 'pingdom'
  ];

  // Check if the user agent matches any bot pattern
  const isBot = botPatterns.some(pattern =>
    userAgent.toLowerCase().includes(pattern)
  );

  if (isBot) {
    // Return 403 Forbidden for bots
    return new NextResponse('Access Denied', { status: 403 });
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

  return response;
}

// Apply to all routes except API routes and static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
