'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageData {
  id: number;
  src: string;
  alt: string;
  caption: string;
}

type LayoutType = 'grid' | 'bento' | 'jazz';

export default function GalleryPage() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  const [activeLayout, setActiveLayout] = useState<LayoutType>('grid');

  useEffect(() => {
    fetchImages();

    // Check if mobile on mount
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
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

  // Responsive pagination logic (only for grid layout)
  const IMAGES_PER_PAGE = isMobile ? 6 : 9; // 6 for mobile (2x3), 9 for desktop (3x3)
  const totalPages = Math.ceil(images.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const currentImages = activeLayout === 'grid' ? images.slice(startIndex, endIndex) : images;

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Modal navigation functions
  const goToNextImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const nextIndex = (currentIndex + 1) % images.length; // Loop back to first
    setSelectedImage(images[nextIndex]);
  };

  const goToPrevImage = () => {
    if (!selectedImage) return;
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1; // Loop to last
    setSelectedImage(images[prevIndex]);
  };

  // Reset to page 1 when screen size or layout changes
  useEffect(() => {
    setCurrentPage(1);
  }, [isMobile, activeLayout]);

  // Render different layouts
  const renderGridLayout = () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
      {currentImages.map((image) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
          onClick={() => setSelectedImage(image)}
        >
          <div className="relative h-64 bg-gray-200">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-contain group-hover:opacity-90 transition-opacity"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );

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

    // For bento, show per-page (9 images fits the pattern nicely)
    const bentoImagesPerPage = 9;
    const bentoTotalPages = Math.ceil(images.length / bentoImagesPerPage);
    const bentoStartIndex = (currentPage - 1) * bentoImagesPerPage;
    const bentoEndIndex = bentoStartIndex + bentoImagesPerPage;
    const bentoCurrentImages = images.slice(bentoStartIndex, bentoEndIndex);

    return (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-3 auto-rows-[200px] gap-4 mb-8">
          {bentoCurrentImages.map((image, index) => {
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

        {/* Pagination for bento */}
        {bentoTotalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mb-8">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <ChevronLeftIcon className="h-5 w-5" />
              Previous
            </button>

            <span className="text-gray-600">
              Page {currentPage} of {bentoTotalPages}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === bentoTotalPages}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                currentPage === bentoTotalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Next
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </>
    );
  };

  const renderJazzHandsLayout = () => {
    // Calculate container height
    const containerHeight = 1000;

    // Animation variants for different crazy effects
    const getRandomAnimation = () => {
      const animations = [
        // Bouncing
        {
          type: 'bounce',
          animate: {
            y: [0, -100, 0, -50, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 0.8, 1.1, 1],
          },
          transition: {
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
          }
        },
        // Floating
        {
          type: 'float',
          animate: {
            y: [-20, 20, -20],
            x: [-10, 10, -10],
            rotate: [-10, 10, -10],
          },
          transition: {
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
          }
        },
        // Spinning
        {
          type: 'spin',
          animate: {
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          },
          transition: {
            duration: 5 + Math.random() * 3,
            repeat: Infinity,
          }
        },
        // Pulsing/Appearing/Disappearing
        {
          type: 'pulse',
          animate: {
            opacity: [0.3, 1, 0.3],
            scale: [0.8, 1.2, 0.8],
          },
          transition: {
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
          }
        },
        // Raining (falling)
        {
          type: 'rain',
          animate: {
            y: [0, containerHeight],
            rotate: [0, 180, 360],
          },
          transition: {
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
          }
        },
        // Wiggle
        {
          type: 'wiggle',
          animate: {
            x: [-30, 30, -30],
            rotate: [-15, 15, -15],
          },
          transition: {
            duration: 1.5 + Math.random(),
            repeat: Infinity,
          }
        },
        // Zoom in/out
        {
          type: 'zoom',
          animate: {
            scale: [0.5, 1.5, 0.5],
            opacity: [0.5, 1, 0.5],
          },
          transition: {
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
          }
        }
      ];

      return animations[Math.floor(Math.random() * animations.length)];
    };

    return (
      <div
        className="relative mb-8 overflow-hidden bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 rounded-lg"
        style={{ height: `${containerHeight}px` }}
      >
        {/* Hint text */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-50 pointer-events-none">
          Jazz-hands! Just sit back and enjoy the show
        </div>

        <AnimatePresence>
          {currentImages.map((image) => {
            // Image dimensions
            const imageSize = isMobile ? 128 : 192; // Smaller for more chaos
            const maxX = window.innerWidth > 1024 ? 1152 - imageSize : window.innerWidth - 32 - imageSize;
            const maxY = containerHeight - imageSize;

            // Random starting position
            const randomX = Math.random() * maxX;
            const randomY = Math.random() * maxY;
            const randomRotate = Math.random() * 360;
            const randomDelay = Math.random() * 2;

            // Get random animation
            const animation = getRandomAnimation();

            return (
              <motion.div
                key={image.id}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: randomX,
                  y: randomY,
                  rotate: randomRotate
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: randomX,
                  y: randomY,
                  rotate: randomRotate,
                  ...animation.animate
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  ...animation.transition,
                  delay: randomDelay
                }}
                className="absolute w-32 h-32 lg:w-48 lg:h-48 bg-white rounded-lg shadow-2xl overflow-hidden pointer-events-none"
                style={{ zIndex: Math.floor(Math.random() * 10) }}
              >
                <div className="relative w-full h-full bg-gray-200">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      
      {/* Tab Layout */}
      <div className="flex justify-center mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveLayout('grid')}
          className={`px-6 py-3 font-medium transition-all ${
            activeLayout === 'grid'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setActiveLayout('bento')}
          className={`px-6 py-3 font-medium transition-all ${
            activeLayout === 'bento'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bento
        </button>
        <button
          onClick={() => setActiveLayout('jazz')}
          className={`px-6 py-3 font-medium transition-all ${
            activeLayout === 'jazz'
              ? 'border-b-2 border-black text-black'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Jazz-hands
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="animate-pulse text-gray-600 text-xl">Loading gallery...</div>
        </div>
      )}

      {/* Empty State */}
      {!loading && images.length === 0 && (
        <div className="bg-white border-l-4 border-black p-6 mb-8">
          <p className="text-black mb-2">
            <strong>No photos yet!</strong>
          </p>
          <p className="text-gray-600">
            Add your photos to the <code className="bg-gray-100 px-2 py-1 rounded">public/images/</code> folder.
            Supported formats: JPG, PNG, GIF, WebP. The gallery will automatically load them!
          </p>
        </div>
      )}

      {/* Render active layout */}
      {!loading && currentImages.length > 0 && (
        <>
          {activeLayout === 'grid' && renderGridLayout()}
          {activeLayout === 'bento' && renderBentoLayout()}
          {activeLayout === 'jazz' && renderJazzHandsLayout()}

          {/* Pagination - only show for grid layout */}
          {activeLayout === 'grid' && totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Previous
              </button>

              <span className="text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-black text-white hover:bg-gray-800'
                }`}
              >
                Next
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          )}
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
          <div className="relative w-full h-[70vh] bg-gray-100">
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
