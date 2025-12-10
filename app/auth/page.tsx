'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function AuthPage() {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [userCount, setUserCount] = useState(0);
  const [showSignup, setShowSignup] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setIsSetup(data.isSetup);
      setUserCount(data.users?.length || 0);
    } catch (error) {
      console.error('Failed to check setup:', error);
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Login automatically with the just-created account
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });

        if (loginResponse.ok) {
          // Use window.location for hard redirect to ensure session is loaded
          window.location.href = '/';
        } else {
          setError('Account created but login failed. Please login manually.');
        }
      } else {
        setError(data.error || 'Setup failed');
      }
    } catch (error) {
      setError('An error occurred during setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use window.location for hard redirect to ensure session is loaded
        window.location.href = '/';
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSetup === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  const isSignupMode = !isSetup || showSignup;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8">

          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
            {isSignupMode ? 'Create Your Account' : 'Welcome Back'}
          </h1>
          <p className="text-center text-slate-600 mb-8">
            {isSignupMode
              ? 'Set up your account to get started'
              : 'Enter your password to continue'}
          </p>

          {/* Form */}
          <form onSubmit={isSignupMode ? handleSetup : handleLogin} className="space-y-6">
            {isSignupMode && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-800 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-slate-200 focus:border-slate-800 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-medium shadow-lg hover:bg-slate-900 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Please wait...' : isSignupMode ? 'Create Account' : 'Login'}
            </button>
          </form>

          {/* Toggle between login and signup */}
          {isSetup && userCount < 2 && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setShowSignup(!showSignup);
                  setError('');
                  setName('');
                  setPassword('');
                }}
                className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                {showSignup ? 'Already have an account? Login' : "Don't have an account? Create One"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
