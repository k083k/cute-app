'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { motion } from 'framer-motion';

interface ImageData {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

type LayoutType = 'polaroid' | 'bento';

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [activeLayout, setActiveLayout] = useState<LayoutType>('polaroid');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      setImages(data);
    } catch {
      // Gallery load failed silently
    } finally {
      setLoading(false);
    }
  };

  const goToNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
    setSelectedImage(images[(currentIndex + 1) % images.length]);
  };

  const goToPrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex((img) => img.id === selectedImage.id);
    setSelectedImage(images[currentIndex === 0 ? images.length - 1 : currentIndex - 1]);
  };

  const bentoPattern = [
    'col-span-2 row-span-2',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-1 row-span-1',
    'col-span-2 row-span-1',
    'col-span-3 row-span-1',
    'col-span-1 row-span-2',
    'col-span-2 row-span-1',
    'col-span-2 row-span-1',
  ];

  const renderBentoLayout = () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[200px] gap-4 mb-8">
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          className={`${bentoPattern[index % bentoPattern.length]} bg-white dark:bg-slate-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group`}
          onClick={() => setSelectedImage(image)}
        >
          <div className="relative w-full h-full bg-gray-200 dark:bg-slate-700">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderPolaroidLayout = () => (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
        {images.map((image, index) => {
          const rotation = Math.random() * 10 - 5;
          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20, rotate: rotation }}
              animate={{ opacity: 1, y: 0, rotate: rotation }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ y: -12, rotate: 0, scale: 1.05, transition: { duration: 0.3 } }}
              className="cursor-pointer"
              onClick={() => setSelectedImage(image)}
            >
              <div className="bg-white dark:bg-slate-200 p-3 shadow-xl hover:shadow-2xl transition-shadow">
                <div className="relative bg-gray-100 dark:bg-gray-200 aspect-square mb-3">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>
                <div className="h-8" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">Gallery</h1>
      </motion.div>

      {/* Layout toggle */}
      <div className="flex justify-center mb-12 gap-4">
        <button
          onClick={() => setActiveLayout('polaroid')}
          className={`px-6 py-3 font-medium rounded-full transition-all ${
            activeLayout === 'polaroid'
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg'
              : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          Polaroid
        </button>
        <button
          onClick={() => setActiveLayout('bento')}
          className={`px-6 py-3 font-medium rounded-full transition-all ${
            activeLayout === 'bento'
              ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-lg'
              : 'bg-white/60 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          Bento
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-slate-600 dark:text-slate-400 text-xl mb-4"
          >
            Loading your memories...
          </motion.div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-slate-400 dark:bg-slate-600 rounded-full"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && images.length === 0 && (
        <div className="glass-slate rounded-2xl shadow-slate p-8 mb-8 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-900 dark:text-white mb-2 text-lg font-semibold">No photos yet!</p>
          <p className="text-slate-600 dark:text-slate-400">
            Add your photos to the{' '}
            <code className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-sm">
              public/images/
            </code>{' '}
            folder. Supported formats: JPG, PNG, GIF, WebP.
          </p>
        </div>
      )}

      {/* Gallery */}
      {!loading && images.length > 0 && (
        <>
          {activeLayout === 'polaroid' && renderPolaroidLayout()}
          {activeLayout === 'bento' && renderBentoLayout()}
        </>
      )}

      {/* Full-size modal */}
      <Modal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        showNavigation={true}
        onPrevious={goToPrevImage}
        onNext={goToNextImage}
      >
        {selectedImage && (
          <div className="relative w-full h-[70vh] bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
