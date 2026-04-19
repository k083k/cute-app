'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useAuth } from '@/components/AuthProvider';
import { useTheme } from '@/components/ThemeProvider';
import SeatCard from '@/components/auth/SeatCard';
import LoginForm from '@/components/auth/LoginForm';
import SetupForm from '@/components/auth/SetupForm';
import { CARD_GRADIENTS, SILHOUETTES } from '@/components/auth/constants';

interface User { id: string; name: string; }
interface SlotState { password: string; name: string; showPassword: boolean; error: string; loading: boolean; }

const emptySlot = (): SlotState => ({ password: '', name: '', showPassword: false, error: '', loading: false });

export default function LandingPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const { theme } = useTheme();

  const [users, setUsers] = useState<(User | null)[]>([null, null]);
  const [pageLoading, setPageLoading] = useState(true);
  const [slots, setSlots] = useState<SlotState[]>([emptySlot(), emptySlot()]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [celebrating, setCelebrating] = useState<boolean[]>([false, false]);

  useEffect(() => { loadUsers(); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const filled: (User | null)[] = [null, null];
      (data.users ?? []).forEach((u: User, i: number) => { if (i < 2) filled[i] = u; });
      setUsers(filled);
    } catch { /* silent */ }
    finally { setPageLoading(false); }
  };

  const patch = (i: number, updates: Partial<SlotState>) =>
    setSlots(prev => prev.map((s, idx) => idx === i ? { ...s, ...updates } : s));

  const handleOpen = (i: number) => {
    if (activeSlot !== null) return;
    patch(i, { error: '', password: '', name: '' });
    setActiveSlot(i);
  };

  const handleClose = () => {
    setActiveSlot(null);
    setCelebrating([false, false]);
  };

  // Auto-celebrate when the already-logged-in user opens their card
  useEffect(() => {
    if (activeSlot === null) return;
    const slotUser = users[activeSlot];
    if (!(slotUser && currentUser && slotUser.id === currentUser.id)) return;
    const t = setTimeout(() => {
      setCelebrating(prev => prev.map((v, idx) => idx === activeSlot ? true : v));
    }, 450);
    return () => clearTimeout(t);
  }, [activeSlot, users, currentUser]);

  const handleLogin = async (i: number) => {
    patch(i, { loading: true, error: '' });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: slots[i].password }),
      });
      const data = await res.json();
      if (res.ok) {
        patch(i, { loading: false });
        setCelebrating(prev => prev.map((v, idx) => idx === i ? true : v));
      } else { patch(i, { error: data.error || 'Incorrect password', loading: false }); }
    } catch { patch(i, { error: 'Something went wrong.', loading: false }); }
  };

  const handleSetup = async (i: number) => {
    patch(i, { loading: true, error: '' });
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: slots[i].name.trim(), password: slots[i].password }),
      });
      const data = await res.json();
      if (res.ok) {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: slots[i].password }),
        });
        if (loginRes.ok) { window.location.href = '/home'; }
        else { await loadUsers(); patch(i, { loading: false, error: 'Account created — you can now log in.' }); handleClose(); }
      } else { patch(i, { error: data.error || 'Setup failed.', loading: false }); }
    } catch { patch(i, { error: 'Something went wrong.', loading: false }); }
  };

  if (pageLoading || authLoading) {
    return (
      <div className="min-h-screen bg-stone-100 dark:bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-400 rounded-full animate-spin" />
      </div>
    );
  }

  const bothEmpty = !users[0] && !users[1];
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#0a0a0f] flex flex-col items-center justify-center px-6 py-12">

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <img
          src={theme === 'dark' ? '/logo-black.png' : '/logo-white.png'}
          alt="Logo"
          className="h-14 w-auto mx-auto mb-4"
        />
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1.5">
          {bothEmpty ? 'Choose a seat to get started.' : 'Choose your seat to continue.'}
        </p>
      </motion.div>

      <LayoutGroup id="seats">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 gap-5 w-full max-w-lg"
        >
          {([0, 1] as const).map((i) => {
            const isCurrentUser = !!(users[i] && currentUser && users[i]!.id === currentUser.id);
            return (
              <SeatCard
                key={i}
                index={i}
                user={users[i]}
                isActive={activeSlot === i}
                isOther={activeSlot !== null && activeSlot !== i}
                isCurrentUser={isCurrentUser}
                onOpen={() => handleOpen(i)}
              />
            );
          })}
        </motion.div>

        <AnimatePresence>
          {activeSlot !== null && (() => {
            const i = activeSlot;
            const user = users[i];
            const slot = slots[i];
            const isCurrentUser = !!(user && currentUser && user.id === currentUser.id);
            return (
              <>
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 bg-black/70 backdrop-blur-md z-40"
                  onClick={handleClose}
                />

                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
                  <motion.div
                    key={`expanded-${i}`}
                    layoutId={`seat-${i}`}
                    className="w-full max-w-[380px] rounded-3xl shadow-2xl pointer-events-auto overflow-hidden relative"
                    style={{ background: CARD_GRADIENTS[i] }}
                  >
                    {/* Full gradient depth */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70 pointer-events-none z-0" />

                    {/* Forest silhouette */}
                    <svg
                      className="absolute bottom-0 left-0 w-full pointer-events-none z-0"
                      viewBox="0 0 400 80"
                      preserveAspectRatio="none"
                      style={{ height: '110px' }}
                    >
                      <path d={SILHOUETTES[i]} fill="rgba(8,3,24,0.72)" />
                    </svg>

                    {/* Close button */}
                    {!celebrating[i] && (
                      <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                        aria-label="Close"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    )}

                    <div className="relative z-10 flex flex-col items-center px-8 pt-10 pb-9">
                      {/* Avatar + ring */}
                      <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-white/20 border-[2.5px] border-white/60 ring-4 ring-white/15 flex items-center justify-center shadow-2xl">
                          {user ? (
                            <span className="text-4xl font-bold text-white select-none drop-shadow">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <PlusIcon className="w-10 h-10 text-white" />
                          )}
                        </div>

                        <AnimatePresence>
                          {celebrating[i] && (
                            <motion.svg
                              key="ring"
                              className="absolute inset-0 w-full h-full"
                              viewBox="0 0 128 128"
                              style={{ transform: 'rotate(-90deg)' }}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            >
                              <motion.circle
                                cx="64" cy="64" r="60"
                                fill="none"
                                stroke="#34d399"
                                strokeWidth="5"
                                strokeLinecap="round"
                                strokeDasharray={376.99}
                                initial={{ strokeDashoffset: 376.99 }}
                                animate={{ strokeDashoffset: 0 }}
                                transition={{ duration: 1.2, ease: 'easeInOut' }}
                                onAnimationComplete={() => router.push('/home')}
                              />
                            </motion.svg>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Name + subtitle */}
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18, duration: 0.22 }}
                        className="text-center mb-6"
                      >
                        {user ? (
                          <>
                            <div className="flex items-center justify-center gap-1.5">
                              <p className="text-xl font-bold text-white drop-shadow">{user.name}</p>
                              <CheckBadgeIcon className="w-5 h-5 text-blue-300" />
                            </div>
                            <p className="text-sm text-white/80 mt-1 font-medium">
                              {celebrating[i] || isCurrentUser ? 'Taking you in…' : 'Enter your password'}
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-xl font-bold text-white drop-shadow">Set up your space</p>
                            <p className="text-sm text-white/80 mt-1 font-medium">Create your account</p>
                          </>
                        )}
                      </motion.div>

                      {/* Form — only shown when not already authenticated, hidden while celebrating */}
                      <AnimatePresence>
                        {!celebrating[i] && !isCurrentUser && (
                          <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ delay: 0.2, duration: 0.2 }}
                            className="w-full rounded-2xl bg-black/35 backdrop-blur-sm border border-white/10 px-5 py-5"
                          >
                            {user ? (
                              <LoginForm slot={slot} onLogin={() => handleLogin(i)} onPatch={(u) => patch(i, u)} />
                            ) : (
                              <SetupForm slot={slot} onSetup={() => handleSetup(i)} onPatch={(u) => patch(i, u)} />
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </div>
              </>
            );
          })()}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
