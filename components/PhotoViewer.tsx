'use client';

import Image from 'next/image';
import { useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';

interface ImageData {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

interface PhotoViewerProps {
  images: ImageData[];
  selected: ImageData | null;
  onSelect: (img: ImageData) => void;
}

export default function PhotoViewer({ images, selected, onSelect }: PhotoViewerProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const thumbRef = useRef<HTMLDivElement>(null);
  const thumbItemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const selectedIndex = selected ? images.findIndex(img => img.id === selected.id) : -1;

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
    onSelect(images[Math.min(selectedIndex + 1, images.length - 1)]);
  }, [images, selectedIndex, onSelect]);

  const selectPrev = useCallback(() => {
    onSelect(images[Math.max(selectedIndex - 1, 0)]);
  }, [images, selectedIndex, onSelect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') selectNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') selectPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectNext, selectPrev]);

  const cardBg = isDark ? 'rgba(8,6,18,0.88)' : 'rgba(245,244,250,0.92)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)';
  const cardShadow = isDark
    ? '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
    : '0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.8)';
  const stripBorder = isDark ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.07)';
  const dimColor = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.55)';
  const ringColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';

  return (
    <div
      className="rounded-3xl overflow-hidden flex w-full"
      style={{
        height: '680px',
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
        <div className="pointer-events-none absolute top-0 left-0 right-0 h-6 z-10"
          style={{ background: `linear-gradient(to bottom, ${cardBg}, transparent)` }} />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-6 z-10"
          style={{ background: `linear-gradient(to top, ${cardBg}, transparent)` }} />

        <div ref={thumbRef} className="flex-1 overflow-y-auto flex flex-col gap-1.5 px-2 py-2"
          style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => {
            const isSelected = selected?.id === img.id;
            return (
              <motion.button
                key={img.id}
                ref={el => { thumbItemRefs.current[i] = el; }}
                onClick={() => onSelect(img)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.02, 0.4) }}
                whileTap={{ scale: 0.94 }}
                className="relative w-full shrink-0 rounded-lg overflow-hidden outline-none cursor-pointer"
                style={{ aspectRatio: '1' }}
              >
                <Image src={img.src} alt="" fill className="object-cover" sizes="106px" />
                <div className="absolute inset-0 transition-opacity duration-200"
                  style={{ background: dimColor, opacity: isSelected ? 0 : 1 }} />
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

        <button onClick={selectPrev} disabled={selectedIndex <= 0}
          className="absolute left-0 top-0 h-full w-1/3 opacity-0 cursor-pointer disabled:cursor-default" />
        <button onClick={selectNext} disabled={selectedIndex >= images.length - 1}
          className="absolute right-0 top-0 h-full w-1/3 opacity-0 cursor-pointer disabled:cursor-default" />
      </div>
    </div>
  );
}
