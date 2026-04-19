'use client';

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps {
  value: string;
  show: boolean;
  placeholder: string;
  autoFocus?: boolean;
  onChange: (v: string) => void;
  onToggle: () => void;
}

export default function PasswordInput({ value, show, placeholder, autoFocus, onChange, onToggle }: PasswordInputProps) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        required
        className="w-full px-4 py-3 pr-11 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#94a3b8] focus:bg-white focus:outline-none transition-colors text-sm"
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] transition-colors"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
      </button>
    </div>
  );
}
