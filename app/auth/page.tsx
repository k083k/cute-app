'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { EyeIcon, EyeSlashIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  name: string;
}

interface SlotState {
  password: string;
  name: string;
  showPassword: boolean;
  error: string;
  loading: boolean;
}

const emptySlot = (): SlotState => ({
  password: '',
  name: '',
  showPassword: false,
  error: '',
  loading: false,
});

function Avatar({ name, size = 'lg' }: { name: string; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
  const text = size === 'lg' ? 'text-3xl' : 'text-xl';
  return (
    <div className={`${dim} rounded-full bg-slate-900 dark:bg-slate-100 flex items-center justify-center shadow-lg shrink-0`}>
      <span className={`${text} font-bold text-white dark:text-slate-900`}>
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

export default function AuthPage() {
  const [users, setUsers] = useState<(User | null)[]>([null, null]);
  const [pageLoading, setPageLoading] = useState(true);
  const [slots, setSlots] = useState<SlotState[]>([emptySlot(), emptySlot()]);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      const filled: (User | null)[] = [null, null];
      (data.users ?? []).forEach((u: User, i: number) => {
        if (i < 2) filled[i] = u;
      });
      setUsers(filled);
    } catch {
      // silent
    } finally {
      setPageLoading(false);
    }
  };

  const patch = (i: number, updates: Partial<SlotState>) =>
    setSlots((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...updates } : s)));

  const handleOpen = (i: number) => {
    if (activeSlot !== null) return;
    patch(i, { error: '', password: '', name: '' });
    setActiveSlot(i);
  };

  const handleClose = () => {
    setActiveSlot(null);
  };

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
        window.location.href = '/';
      } else {
        patch(i, { error: data.error || 'Incorrect password', loading: false });
      }
    } catch {
      patch(i, { error: 'Something went wrong. Try again.', loading: false });
    }
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
        if (loginRes.ok) {
          window.location.href = '/';
        } else {
          await loadUsers();
          patch(i, { loading: false, error: 'Account created — you can now log in.' });
          handleClose();
        }
      } else {
        patch(i, { error: data.error || 'Setup failed. Try again.', loading: false });
      }
    } catch {
      patch(i, { error: 'Something went wrong. Try again.', loading: false });
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-slate-800 dark:border-t-slate-300 rounded-full animate-spin" />
      </div>
    );
  }

  const bothEmpty = !users[0] && !users[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col items-center justify-center px-4 py-12">

      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          {bothEmpty ? 'Set up your space' : 'Welcome back'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {bothEmpty ? 'Two seats. One for each of you.' : 'Pick your seat to continue.'}
        </p>
      </motion.div>

      <LayoutGroup id="seats">
        {/* ── Grid (always rendered as placeholders) ── */}
        <div className="grid grid-cols-2 gap-5 w-full max-w-xl">
          {([0, 1] as const).map((i) => {
            const user = users[i];
            const isActive = activeSlot === i;
            const isOther = activeSlot !== null && activeSlot !== i;

            return (
              <motion.div
                key={i}
                layoutId={`seat-${i}`}
                onClick={() => handleOpen(i)}
                animate={{
                  opacity: isActive ? 0 : isOther ? 0.25 : 1,
                  scale: isOther ? 0.93 : 1,
                }}
                transition={{ duration: 0.25 }}
                style={{ pointerEvents: isActive ? 'none' : 'auto' }}
                className={`rounded-3xl overflow-hidden cursor-pointer ${
                  user
                    ? 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg'
                    : 'bg-white/60 dark:bg-slate-800/40 border-2 border-dashed border-slate-300 dark:border-slate-600'
                }`}
              >
                {user ? (
                  /* Filled — collapsed */
                  <div className="p-10 flex flex-col items-center gap-4">
                    <Avatar name={user.name} size="lg" />
                    <div className="text-center">
                      <p className="text-xl font-semibold text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                        That&apos;s me →
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Empty — collapsed */
                  <div className="p-10 flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      <PlusIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center">
                      Set up your space
                    </p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* ── Overlay ── */}
        <AnimatePresence>
          {activeSlot !== null && (() => {
            const i = activeSlot;
            const user = users[i];
            const slot = slots[i];

            return (
              <>
                {/* Backdrop */}
                <motion.div
                  key="backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                  onClick={handleClose}
                />

                {/* Zoomed card */}
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                  <motion.div
                    key={`expanded-${i}`}
                    layoutId={`seat-${i}`}
                    className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-3xl shadow-2xl pointer-events-auto overflow-hidden"
                  >
                    {/* Close button */}
                    <div className="flex justify-end px-6 pt-5">
                      <button
                        onClick={handleClose}
                        className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        aria-label="Close"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18, duration: 0.22 }}
                      className="px-8 pb-8"
                    >
                      {user ? (
                        /* ── Login form ── */
                        <>
                          <div className="flex flex-col items-center gap-3 mb-7">
                            <Avatar name={user.name} size="lg" />
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                              {user.name}
                            </p>
                          </div>

                          <form
                            onSubmit={(e) => { e.preventDefault(); handleLogin(i); }}
                            className="space-y-3"
                          >
                            <div className="relative">
                              <input
                                type={slot.showPassword ? 'text' : 'password'}
                                value={slot.password}
                                onChange={(e) => patch(i, { password: e.target.value })}
                                placeholder="Password"
                                autoFocus
                                required
                                className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-700 dark:focus:border-slate-400 focus:outline-none transition-colors"
                              />
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => patch(i, { showPassword: !slot.showPassword })}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                aria-label={slot.showPassword ? 'Hide password' : 'Show password'}
                              >
                                {slot.showPassword
                                  ? <EyeSlashIcon className="w-5 h-5" />
                                  : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>

                            {slot.error && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-600 dark:text-red-400"
                                role="alert"
                              >
                                {slot.error}
                              </motion.p>
                            )}

                            <button
                              type="submit"
                              disabled={slot.loading || !slot.password}
                              className="w-full py-3 bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {slot.loading ? 'Logging in…' : 'Login'}
                            </button>
                          </form>
                        </>
                      ) : (
                        /* ── Setup form ── */
                        <>
                          <div className="flex flex-col items-center gap-2 mb-7">
                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center">
                              <PlusIcon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                              Set up your space
                            </p>
                          </div>

                          <form
                            onSubmit={(e) => { e.preventDefault(); handleSetup(i); }}
                            className="space-y-3"
                          >
                            <input
                              type="text"
                              value={slot.name}
                              onChange={(e) => patch(i, { name: e.target.value })}
                              placeholder="Your name"
                              autoFocus
                              required
                              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-700 dark:focus:border-slate-400 focus:outline-none transition-colors"
                            />

                            <div className="relative">
                              <input
                                type={slot.showPassword ? 'text' : 'password'}
                                value={slot.password}
                                onChange={(e) => patch(i, { password: e.target.value })}
                                placeholder="Choose a password"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-slate-700 dark:focus:border-slate-400 focus:outline-none transition-colors"
                              />
                              <button
                                type="button"
                                tabIndex={-1}
                                onClick={() => patch(i, { showPassword: !slot.showPassword })}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                aria-label={slot.showPassword ? 'Hide password' : 'Show password'}
                              >
                                {slot.showPassword
                                  ? <EyeSlashIcon className="w-5 h-5" />
                                  : <EyeIcon className="w-5 h-5" />}
                              </button>
                            </div>

                            {slot.error && (
                              <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-red-600 dark:text-red-400"
                                role="alert"
                              >
                                {slot.error}
                              </motion.p>
                            )}

                            <button
                              type="submit"
                              disabled={slot.loading || !slot.name.trim() || slot.password.length < 6}
                              className="w-full py-3 bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {slot.loading ? 'Creating…' : 'Claim this seat'}
                            </button>
                          </form>
                        </>
                      )}
                    </motion.div>
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
