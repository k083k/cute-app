'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  GiftIcon,
  SparklesIcon,
  PhotoIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';

const navigation = [
  { name: 'Bible Verse', href: '/', icon: SparklesIcon },
  { name: 'Gallery', href: '/gallery', icon: PhotoIcon },
  { name: 'Motivation', href: '/motivation', icon: GiftIcon },
  { name: 'Notes', href: '/notes', icon: DocumentTextIcon },
  { name: 'Games', href: '/games', icon: PuzzlePieceIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  return (
    <Disclosure
      as="nav"
      className="glass-slate border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-50 backdrop-blur-lg"
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <Link href="/">
                  <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-white cursor-pointer hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    <span>AAA</span>
                  </h1>
                </Link>
              </div>

              {/* Desktop Navigation */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-baseline space-x-1">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            isActive(item.href)
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Dark mode toggle */}
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    aria-label="Toggle dark mode"
                  >
                    {theme === 'dark' ? (
                      <SunIcon className="h-5 w-5" />
                    ) : (
                      <MoonIcon className="h-5 w-5" />
                    )}
                  </button>

                  {/* Logout */}
                  <button
                    onClick={logout}
                    className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200"
                    title="Logout"
                    aria-label="Logout"
                  >
                    <FontAwesomeIcon icon={faPowerOff} className="h-4 w-4" />
                  </button>
                </div>
              )}

              {/* Mobile: theme toggle + hamburger */}
              <div className="md:hidden flex items-center gap-1">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  aria-label="Toggle dark mode"
                >
                  {theme === 'dark' ? (
                    <SunIcon className="h-5 w-5" />
                  ) : (
                    <MoonIcon className="h-5 w-5" />
                  )}
                </button>

                {isAuthenticated && (
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu panel */}
          {isAuthenticated && (
            <Disclosure.Panel className="md:hidden border-t border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-full text-base font-medium transition-all ${
                        isActive(item.href)
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                >
                  <FontAwesomeIcon icon={faPowerOff} className="h-5 w-5" />
                  Logout
                </button>
              </div>
            </Disclosure.Panel>
          )}
        </>
      )}
    </Disclosure>
  );
}
