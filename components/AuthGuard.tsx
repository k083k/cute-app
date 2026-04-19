'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from './AuthProvider';

// Routes that don't require authentication
const PUBLIC_ROUTES = ['/'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublic = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isPublic) return;
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, pathname, router, isPublic]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (isPublic) return <>{children}</>;

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
