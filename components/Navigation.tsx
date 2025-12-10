'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, GiftIcon, SparklesIcon, PhotoIcon, DocumentTextIcon, PuzzlePieceIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons';

const navigation = [
  { name: 'Bible Verse', href: '/', icon: SparklesIcon },
  { name: 'Gallery', href: '/gallery', icon: PhotoIcon },
  { name: 'Motivation', href: '/motivation', icon: GiftIcon },
  { name: 'Notes', href: '/notes', icon: DocumentTextIcon },
  { name: 'Games', href: '/games', icon: PuzzlePieceIcon },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
    } catch (error) {
      console.error('Error checking auth:', error);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      if (response.ok) {
        setIsAuthenticated(false);
        router.push('/auth');
        router.refresh();
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Disclosure as="nav" className="glass-slate border-b border-slate-200 shadow-sm sticky top-0 z-50 backdrop-blur-lg bg-white/80">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Logo/Title */}
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-slate-900">
                    <span className="hidden sm:inline">Ama Ansaa Asiedu</span>
                    <span className="sm:hidden">Ansaa</span>
                  </h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              {isAuthenticated && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="flex items-baseline space-x-2">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            isActive(item.href)
                              ? 'bg-slate-900 text-white shadow-lg'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-full text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                    title="Logout"
                  >
                    <FontAwesomeIcon icon={faPowerOff} className="h-5 w-5" />
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              {isAuthenticated && (
                <div className="md:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu */}
          {isAuthenticated && (
            <Disclosure.Panel className="md:hidden border-t border-slate-200">
              <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center gap-3 px-3 py-2 rounded-full text-base font-medium transition-all ${
                        isActive(item.href)
                          ? 'bg-slate-900 text-white shadow-lg'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}

                {/* Mobile Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-full text-base font-medium text-red-600 hover:bg-red-50 transition-all"
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
