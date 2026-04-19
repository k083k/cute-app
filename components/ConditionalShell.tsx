'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';
import Footer from './Footer';

export default function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/') {
    return <main className="flex-1">{children}</main>;
  }

  const isHome = pathname === '/home';

  return (
    <>
      <Navigation />
      <main className={isHome ? 'flex-1 relative overflow-hidden' : 'flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        {children}
      </main>
      {!isHome && <Footer />}
    </>
  );
}
