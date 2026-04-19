'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PhotoViewer from '@/components/PhotoViewer';

interface ImageData {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ImageData | null>(null);

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

  if (loading) {
    return (
      <div className="h-[calc(100dvh-4rem)] flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1.5 h-1.5 bg-white/40 rounded-full"
              animate={{ y: [0, -6, 0] }} transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }} />
          ))}
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="h-[calc(100dvh-4rem)] flex items-center justify-center">
        <p className="text-white/50 text-sm">No photos yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 pointer-events-none home-bg">
        <div className="absolute inset-0 bg-black/30 dark:bg-black/40" />
      </div>

      <div className="h-[calc(100dvh-4rem)] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-5xl w-full"
        >
          <PhotoViewer images={images} selected={selected} onSelect={setSelected} />
        </motion.div>
      </div>
    </>
  );
}
