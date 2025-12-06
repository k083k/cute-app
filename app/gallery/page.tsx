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

type LayoutType = 'polaroid' | 'bento' | 'secret';

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [secretImages, setSecretImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [activeLayout, setActiveLayout] = useState<LayoutType>('polaroid');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const response = await fetch('/api/images');
      const data = await response.json();
      setImages(data);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSecretImages = async () => {
    try {
      const response = await fetch('/api/secret-images');
      if (response.ok) {
        const data = await response.json();
        setSecretImages(data);
      }
    } catch (error) {
      console.error('Error fetching secret images:', error);
    }
  };

  // Display images based on layout
  const displayImages = activeLayout === 'secret' ? secretImages : images;
  const currentImages = displayImages;

  // Modal navigation functions
  const goToNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = displayImages.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % displayImages.length; // Loop back to first
    setSelectedImage(displayImages[nextIndex]);
  };

  const goToPrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = displayImages.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1; // Loop to last
    setSelectedImage(displayImages[prevIndex]);
  };

  // Reset authentication when leaving secret tab
  useEffect(() => {
    if (activeLayout !== 'secret' && isAuthenticated) {
      // Clear authentication when user leaves the secret tab
      setIsAuthenticated(false);
    }
  }, [activeLayout, isAuthenticated]);

  // Handle secret tab click
  const handleSecretTabClick = () => {
    // Always show auth modal - maximum security (one-time access per visit)
    setShowAuthModal(true);
  };

  // Handle authentication
  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: secretCode }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setActiveLayout('secret');
        setAuthError('');
        setSecretCode('');
        // Fetch secret images after successful authentication
        fetchSecretImages();
      } else {
        setAuthError(data.message || 'Incorrect code. Try again!');
        setSecretCode('');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setAuthError('An error occurred. Please try again.');
      setSecretCode('');
    }
  };

  const renderBentoLayout = () => {
    // Bento grid pattern - repeating pattern that properly uses 3 columns on desktop
    const bentoPattern = [
      'col-span-2 row-span-2', // large square - 2 cols, 2 rows
      'col-span-1 row-span-1', // small - fills the right side
      'col-span-1 row-span-1', // small - fills the right side
      'col-span-1 row-span-1', // small
      'col-span-2 row-span-1', // wide - 2 cols, 1 row
      'col-span-3 row-span-1', // full width - spans all 3 columns
      'col-span-1 row-span-2', // tall - 1 col, 2 rows
      'col-span-2 row-span-1', // wide - 2 cols, 1 row
      'col-span-2 row-span-1', // wide - 2 cols, 1 row
    ];

    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[200px] gap-4 mb-8">
        {currentImages.map((image, index) => {
          const pattern = bentoPattern[index % bentoPattern.length];
          return (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`${pattern} bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group`}
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative w-full h-full bg-gray-200">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderPolaroidLayout = () => {
    // Generate random rotation for each polaroid
    const getRandomRotation = () => {
      return Math.random() * 10 - 5; // -5 to 5 degrees
    };

    return (
      <div className="mb-8">
        {/* Grid layout with scattered polaroids */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 lg:gap-12">
          {currentImages.map((image, index) => {
            const rotation = getRandomRotation();

            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20, rotate: rotation }}
                animate={{ opacity: 1, y: 0, rotate: rotation }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{
                  y: -12,
                  rotate: 0,
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
                className="cursor-pointer"
                onClick={() => setSelectedImage(image)}
              >
                {/* Polaroid frame */}
                <div className="bg-white p-3 shadow-xl hover:shadow-2xl transition-shadow">
                  {/* Image area */}
                  <div className="relative bg-gray-100 aspect-square mb-3">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>

                  {/* Bottom white space - classic Polaroid look */}
                  <div className="h-8"></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSecretLayout = () => (
    <div className="space-y-8">
      {/* Special header for secret section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-slate border-2 border-slate-300 rounded-2xl p-8 text-center shadow-slate"
      >
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Just You and Me</h2>
        <p className="text-slate-600">Our special little corner of the internet</p>
      </motion.div>

      {/* Secret images grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {currentImages.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group border-2 border-pink-200"
            onClick={() => setSelectedImage(image)}
          >
            <div className="relative h-96 bg-white overflow-hidden">
              {/* Use regular img tag for API-served images to avoid Next.js Image restrictions */}
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover blur-3xl group-hover:blur-2xl transition-all duration-300"
              />
              {/* Overlay hint */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/30 text-white px-4 py-2 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Gallery Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
          Memory Gallery
        </h1>
        <p className="text-slate-600 text-lg">
          Our beautiful moments together
        </p>
      </motion.div>

      {/* Tab Layout */}
      <div className="flex justify-center mb-12 gap-4">
        <button
          onClick={() => setActiveLayout('polaroid')}
          className={`px-6 py-3 font-medium rounded-full transition-all ${
            activeLayout === 'polaroid'
              ? 'bg-slate-800 text-white shadow-lg'
              : 'bg-white/60 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Polaroid
        </button>
        <button
          onClick={() => setActiveLayout('bento')}
          className={`px-6 py-3 font-medium rounded-full transition-all ${
            activeLayout === 'bento'
              ? 'bg-slate-800 text-white shadow-lg'
              : 'bg-white/60 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Bento
        </button>
        <button
          onClick={handleSecretTabClick}
          className={`px-6 py-3 font-medium rounded-full transition-all ${
            activeLayout === 'secret'
              ? 'bg-slate-700 text-white shadow-lg'
              : 'bg-white/60 text-slate-700 hover:bg-slate-100'
          }`}
        >
          Secret
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh]">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-slate-600 text-xl mb-4"
          >
            Loading your memories...
          </motion.div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-slate-400 rounded-full"
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && images.length === 0 && (
        <div className="glass-slate rounded-2xl shadow-slate p-8 mb-8 border border-slate-200">
          <p className="text-slate-900 mb-2 text-lg font-semibold">
            No photos yet!
          </p>
          <p className="text-slate-600">
            Add your photos to the <code className="bg-slate-100 px-2 py-1 rounded">public/images/</code> folder.
            Supported formats: JPG, PNG, GIF, WebP. The gallery will automatically load them!
          </p>
        </div>
      )}

      {/* Render active layout */}
      {!loading && currentImages.length > 0 && (
        <>
          {activeLayout === 'polaroid' && renderPolaroidLayout()}
          {activeLayout === 'bento' && renderBentoLayout()}
          {activeLayout === 'secret' && renderSecretLayout()}
        </>
      )}

      {/* Modal for full-size image */}
      <Modal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        showNavigation={true}
        onPrevious={goToPrevImage}
        onNext={goToNextImage}
      >
        {selectedImage && (
          <div className="relative w-full h-[70vh] bg-gray-100 flex items-center justify-center">
            {/* Use Next Image for public images, regular img for secret images */}
            {activeLayout === 'secret' ? (
              <img
                src={selectedImage.src}
                alt={selectedImage.alt}
                className="max-w-full max-h-full object-contain"
              />
            ) : (
              <Image
                src={selectedImage.src}
                alt={selectedImage.alt}
                fill
                className="object-contain"
                sizes="90vw"
                priority
              />
            )}
          </div>
        )}
      </Modal>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🤫</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Secret Section</h3>
              <p className="text-gray-600">Enter the secret code to continue</p>
            </div>

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  placeholder="Enter secret code..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-pink-500 focus:outline-none text-center text-lg"
                  autoFocus
                />
                {authError && (
                  <p className="text-red-500 text-sm mt-2 text-center">{authError}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAuthModal(false);
                    setAuthError('');
                    setSecretCode('');
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors font-medium"
                >
                  Unlock 🔓
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-xs text-gray-400">
              <p>Hint: It's about us 💕</p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
