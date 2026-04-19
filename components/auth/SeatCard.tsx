'use client';

import { motion } from 'framer-motion';
import { PlusIcon, FingerPrintIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { CARD_GRADIENTS, SILHOUETTES } from './constants';

interface User { id: string; name: string; }

interface SeatCardProps {
  index: number;
  user: User | null;
  isActive: boolean;
  isOther: boolean;
  isCurrentUser: boolean;
  onOpen: () => void;
}

export default function SeatCard({ index, user, isActive, isOther, onOpen }: SeatCardProps) {
  return (
    <motion.div
      layoutId={`seat-${index}`}
      onClick={onOpen}
      animate={{
        opacity: isActive ? 0 : isOther ? 0.3 : 1,
        scale: isOther ? 0.92 : 1,
        y: isOther ? 8 : 0,
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ pointerEvents: isActive ? 'none' : 'auto', background: CARD_GRADIENTS[index] }}
      whileHover={!isActive && !isOther ? { y: -6, scale: 1.03, transition: { duration: 0.2 } } : undefined}
      className="cursor-pointer rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col h-72 relative"
    >
      {/* Gradient depth — darkens the bottom so white text stays legible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60 pointer-events-none" />

      {/* Forest silhouette — fills to the very bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
        style={{ height: '72px' }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={SILHOUETTES[index]} fill="rgba(8,3,24,0.60)" />
      </svg>

      {/* Top: name + status */}
      <div className="relative z-10 pt-5 px-4 text-center">
        {user ? (
          <>
            <div className="flex items-center justify-center gap-1.5">
              <p className="text-sm font-bold text-white leading-tight drop-shadow">{user.name}</p>
              <CheckBadgeIcon className="w-4 h-4 text-blue-300 shrink-0" />
            </div>
            <p className="text-[11px] text-white/80 mt-0.5 font-medium tracking-wide">Online</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-white/65 leading-tight">Empty seat</p>
            <p className="text-[11px] text-white/45 mt-0.5">Tap to set up</p>
          </>
        )}
      </div>

      {/* Center: avatar on the landscape */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-2">
        {user ? (
          <>
            <div className="relative">
              <div className="w-[72px] h-[72px] rounded-full bg-white/20 border-[2.5px] border-white/60 ring-4 ring-white/15 flex items-center justify-center shadow-2xl">
                <span className="text-2xl font-bold text-white select-none drop-shadow">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white/30 shadow-lg" />
            </div>
            <p className="text-[11px] text-white/75 font-medium drop-shadow">Your space</p>
          </>
        ) : (
          <div className="w-[72px] h-[72px] rounded-full border-2 border-dashed border-white/40 flex items-center justify-center">
            <PlusIcon className="w-7 h-7 text-white/55" />
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="relative z-10 flex items-stretch border-t border-white/10" style={{ background: 'rgba(10,5,30,0.55)' }}>
        {user ? (
          <button className="flex-1 flex flex-col items-center justify-center gap-1 py-3 hover:bg-white/10 transition-colors">
            <FingerPrintIcon className="w-5 h-5 text-white/85" />
            <span className="text-[11px] font-semibold text-white/80 tracking-wide">Profile</span>
          </button>
        ) : (
          <button className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-white/10 transition-colors">
            <PlusIcon className="w-4 h-4 text-white/85" />
            <span className="text-xs font-bold text-white/80 tracking-widest uppercase">Set up</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}
