'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

interface ImageData {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

export default function GalleryPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ImageData | null>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const thumbItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => { fetchImages(); }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch('/api/images');
      const data = await res.json();
      setImages(data);
      if (data.length > 0) setSelected(data[0]);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  const selectedIndex = selected ? images.findIndex(img => img.id === selected.id) : -1;

  // Scroll the strip so the selected thumb is fully in view
  useEffect(() => {
    const container = thumbRef.current;
    const item = thumbItemRefs.current[selectedIndex];
    if (!container || !item) return;

    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const itemTop = item.offsetTop;
    const itemBottom = itemTop + item.offsetHeight;

    if (itemTop < containerTop) {
      container.scrollTo({ top: itemTop - 8, behavior: 'smooth' });
    } else if (itemBottom > containerBottom) {
      container.scrollTo({ top: itemBottom - container.clientHeight + 8, behavior: 'smooth' });
    }
  }, [selectedIndex]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (thumbRef.current) thumbRef.current.scrollTop += e.deltaY;
  };

  const selectNext = useCallback(() => {
    setSelected(prev => {
      const idx = images.findIndex(img => img.id === prev?.id);
      return idx < images.length - 1 ? images[idx + 1] : prev;
    });
  }, [images]);

  const selectPrev = useCallback(() => {
    setSelected(prev => {
      const idx = images.findIndex(img => img.id === prev?.id);
      return idx > 0 ? images[idx - 1] : prev;
    });
  }, [images]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') selectNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') selectPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectNext, selectPrev]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <motion.p animate={{ opacity: [0.3, 0.9, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
          className="text-slate-400 dark:text-white/40 text-sm">Loading…</motion.p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 bg-slate-300 dark:bg-white/30 rounded-full"
              animate={{ y: [0, -6, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-2 text-center">
        <p className="text-slate-500 dark:text-white/50 font-medium">No photos yet</p>
        <p className="text-slate-400 dark:text-white/25 text-sm">
          Add images to <code className="bg-black/5 dark:bg-white/8 px-1.5 py-0.5 rounded text-xs">public/images/</code>
        </p>
      </div>
    );
  }

  const cardBg = isDark
    ? 'rgba(8,6,18,0.88)'
    : 'rgba(245,244,250,0.92)';
  const cardBorder = isDark
    ? '1px solid rgba(255,255,255,0.06)'
    : '1px solid rgba(0,0,0,0.08)';
  const cardShadow = isDark
    ? '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)';
  const stripBorder = isDark
    ? '1px solid rgba(255,255,255,0.05)'
    : '1px solid rgba(0,0,0,0.07)';
  const dimColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)';
  const ringColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto"
    >
      {/* Counter only — no heading */}
      <div className="mb-4 flex justify-end">
        <span className="text-xs text-slate-400 dark:text-white/25 tabular-nums tracking-widest">
          {selectedIndex + 1} — {images.length}
        </span>
      </div>

      {/* Viewer card */}
      <div
        className="rounded-3xl overflow-hidden flex"
        style={{
          height: '580px',
          background: cardBg,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: cardBorder,
          boxShadow: cardShadow,
        }}
      >
        {/* Film strip */}
        <div
          className="w-[106px] shrink-0 flex flex-col relative"
          style={{ borderRight: stripBorder }}
          onWheel={handleWheel}
        >
          {/* top fade */}
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 h-6 z-10"
            style={{ background: `linear-gradient(to bottom, ${cardBg}, transparent)` }}
          />
          {/* bottom fade */}
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 z-10"
            style={{ background: `linear-gradient(to top, ${cardBg}, transparent)` }}
          />

          <div
            ref={thumbRef}
            className="flex-1 overflow-y-auto flex flex-col gap-1.5 px-2 py-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {images.map((img, i) => {
              const isSelected = selected?.id === img.id;
              return (
                <motion.button
                  key={img.id}
                  ref={el => { thumbItemRefs.current[i] = el; }}
                  onClick={() => setSelected(img)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
                  whileTap={{ scale: 0.94 }}
                  className="relative w-full shrink-0 rounded-lg overflow-hidden outline-none cursor-pointer"
                  style={{ aspectRatio: '1' }}
                >
                  <Image src={img.src} alt="" fill className="object-cover" sizes="106px" />
                  {/* dim unselected */}
                  <div
                    className="absolute inset-0 transition-opacity duration-200"
                    style={{ background: dimColor, opacity: isSelected ? 0 : 1 }}
                  />
                  {/* selection ring */}
                  {isSelected && (
                    <motion.div
                      layoutId="strip-sel"
                      className="absolute inset-0 rounded-lg"
                      style={{ boxShadow: `inset 0 0 0 2px ${ringColor}` }}
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Main viewer */}
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Image
                  src={selected.src}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 82vw, 820px"
                  priority
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Invisible click zones */}
          <button onClick={selectPrev} disabled={selectedIndex <= 0}
            className="absolute left-0 top-0 h-full w-1/3 opacity-0 cursor-pointer disabled:cursor-default" />
          <button onClick={selectNext} disabled={selectedIndex >= images.length - 1}
            className="absolute right-0 top-0 h-full w-1/3 opacity-0 cursor-pointer disabled:cursor-default" />
        </div>
      </div>

    </motion.div>
  );
}
