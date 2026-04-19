'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  SparklesIcon,
  PhotoIcon,
  DocumentTextIcon,
  PuzzlePieceIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';

const navigation = [
  { name: 'Verse', href: '/home', icon: SparklesIcon },
  { name: 'Gallery', href: '/gallery', icon: PhotoIcon },
  { name: 'Notes', href: '/notes', icon: DocumentTextIcon },
  { name: 'Games', href: '/games', icon: PuzzlePieceIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => pathname === path;

  return (
    <Disclosure
      as="nav"
      className="sticky top-0 z-50 backdrop-blur-xl border-b border-black/10 dark:border-white/8"
      style={{
        background: theme === 'dark' ? 'rgba(0,0,0,0.38)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
      }}
    >
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">

              {/* Logo */}
              <Link href="/" className="flex items-center group">
                <img
                  src={theme === 'dark' ? '/logo-black.png' : '/logo-white.png'}
                  alt="Logo"
                  className="h-8 w-auto group-hover:scale-105 transition-transform duration-200"
                />
              </Link>

              {/* Desktop nav */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-0.5">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                          active
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-white/55 hover:text-gray-900 dark:hover:text-white/90 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="nav-active-pill"
                            className="absolute inset-0 rounded-full bg-black/[0.07] dark:bg-white/[0.14]"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <Icon className="relative h-3.5 w-3.5" />
                        <span className="relative">{item.name}</span>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Right side */}
              <div className="flex items-center gap-1">
                {/* Theme toggle — explicit size to beat the touch-target min-height rule */}
                <button
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                  className="w-8 h-8 flex items-center justify-center rounded-full
                    text-gray-600 dark:text-white/50
                    hover:text-gray-900 dark:hover:text-white/90
                    hover:bg-black/[0.06] dark:hover:bg-white/[0.10]
                    transition-all duration-200"
                  style={{ minHeight: 'unset', minWidth: 'unset' }}
                >
                  {theme === 'dark'
                    ? <SunIcon className="h-4 w-4" />
                    : <MoonIcon className="h-4 w-4" />}
                </button>

                {isAuthenticated && (
                  <>
                    {/* Avatar = logout (initial → power icon on hover) */}
                    {user && (
                      <button
                        onClick={logout}
                        title="Logout"
                        style={{ minHeight: 'unset', minWidth: 'unset' }}
                        className="group relative w-8 h-8 rounded-full ml-1 flex items-center justify-center overflow-hidden
                          bg-black/8 border border-black/20 dark:bg-white/14 dark:border-white/25
                          hover:bg-red-500/20 hover:border-red-400/40
                          transition-all duration-200"
                      >
                        <span className="absolute text-gray-800 dark:text-white text-xs font-bold select-none transition-opacity duration-200 group-hover:opacity-0">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                        <FontAwesomeIcon
                          icon={faPowerOff}
                          className="absolute h-3.5 w-3.5 text-red-500 dark:text-red-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                        />
                      </button>
                    )}

                    {/* Mobile hamburger */}
                    <Disclosure.Button
                      style={{ minHeight: 'unset', minWidth: 'unset' }}
                      className="md:hidden w-8 h-8 flex items-center justify-center rounded-full ml-1
                        text-white/50 hover:text-white hover:bg-white/[0.10] transition-all"
                    >
                      <span className="sr-only">Open menu</span>
                      {open ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                    </Disclosure.Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          {isAuthenticated && (
            <Disclosure.Panel
              className="md:hidden border-t border-white/[0.08] backdrop-blur-xl"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            >
              <div className="space-y-0.5 px-3 py-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? 'bg-black/[0.07] dark:bg-white/[0.14] text-gray-900 dark:text-white'
                          : 'text-gray-600 dark:text-white/55 hover:text-gray-900 dark:hover:text-white hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  );
                })}

                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-400/80 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                  <FontAwesomeIcon icon={faPowerOff} className="h-4 w-4" />
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
