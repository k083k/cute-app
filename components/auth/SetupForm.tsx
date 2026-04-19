'use client';

import PasswordInput from './PasswordInput';
import ErrorMsg from './ErrorMsg';
import SubmitButton from './SubmitButton';

interface SlotState { password: string; name: string; showPassword: boolean; error: string; loading: boolean; }

interface SetupFormProps {
  slot: SlotState;
  onSetup: () => void;
  onPatch: (u: Partial<SlotState>) => void;
}

export default function SetupForm({ slot, onSetup, onPatch }: SetupFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSetup(); }} className="space-y-3">
      <input
        type="text"
        value={slot.name}
        onChange={(e) => onPatch({ name: e.target.value })}
        placeholder="Your name"
        autoFocus
        required
        className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-[#0f172a] placeholder-[#94a3b8] focus:border-[#94a3b8] focus:bg-white focus:outline-none transition-colors text-sm"
      />
      <PasswordInput
        value={slot.password}
        show={slot.showPassword}
        placeholder="Password (min. 6 chars)"
        onChange={(v) => onPatch({ password: v })}
        onToggle={() => onPatch({ showPassword: !slot.showPassword })}
      />
      <ErrorMsg text={slot.error} />
      <SubmitButton loading={slot.loading} disabled={!slot.name.trim() || slot.password.length < 6}>
        {slot.loading ? 'Creating…' : 'Claim this seat'}
      </SubmitButton>
    </form>
  );
}
