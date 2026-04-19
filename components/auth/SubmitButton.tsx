'use client';

import { ReactNode } from 'react';

interface SubmitButtonProps {
  children: ReactNode;
  loading: boolean;
  disabled: boolean;
}

// bg-[#0f172a] uses a literal hex — bypasses the CSS variable remapping that makes
// bg-slate-900 render as near-white in dark mode on this app's color scheme.
export default function SubmitButton({ children, loading, disabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full py-3 bg-[#0f172a] hover:bg-[#1e293b] text-white rounded-xl font-semibold text-sm tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
