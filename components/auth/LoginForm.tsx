'use client';

import PasswordInput from './PasswordInput';
import ErrorMsg from './ErrorMsg';
import SubmitButton from './SubmitButton';

interface SlotState { password: string; showPassword: boolean; error: string; loading: boolean; }

interface LoginFormProps {
  slot: SlotState;
  onLogin: () => void;
  onPatch: (u: Partial<SlotState>) => void;
}

export default function LoginForm({ slot, onLogin, onPatch }: LoginFormProps) {
  return (
    <form onSubmit={(e) => { e.preventDefault(); onLogin(); }} className="space-y-3">
      <PasswordInput
        value={slot.password}
        show={slot.showPassword}
        placeholder="Password"
        autoFocus
        onChange={(v) => onPatch({ password: v })}
        onToggle={() => onPatch({ showPassword: !slot.showPassword })}
      />
      <ErrorMsg text={slot.error} />
      <SubmitButton loading={slot.loading} disabled={!slot.password}>
        {slot.loading ? 'Logging in…' : 'Continue'}
      </SubmitButton>
    </form>
  );
}
