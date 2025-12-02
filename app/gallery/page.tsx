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
  const [isDragging, setIsDragging] = useState(false);

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
              className="object-cover group-hover:opacity-90 transition-opacity"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderBentoLayout = () => {
    // Bento grid pattern - repeating pattern with no gaps
    // Each pattern cycle uses exactly 6 cells (2x3 on mobile, 3x2 on desktop)
    const bentoPattern = [
      'col-span-2 row-span-2', // large square
      'col-span-1 row-span-1', // small
      'col-span-1 row-span-1', // small
      'col-span-1 row-span-1', // small
      'col-span-1 row-span-1', // small
      'col-span-2 row-span-1', // wide
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
    // Calculate container height based on number of images
    const containerHeight = Math.max(800, currentImages.length * 100);

    return (
      <div className="relative mb-8 overflow-hidden bg-gray-50 rounded-lg" style={{ height: `${containerHeight}px` }}>
        {/* Hint text */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm z-50 pointer-events-none">
          Drag images around to explore!
        </div>

        <AnimatePresence>
          {currentImages.map((image, index) => {
            // Image dimensions
            const imageSize = isMobile ? 192 : 256; // w-48 = 192px, w-64 = 256px

            // Random positioning within container bounds
            // Subtract image size to prevent overflow
            const maxX = window.innerWidth > 1024 ? 1152 - imageSize : window.innerWidth - 32 - imageSize; // max-w-6xl or screen width
            const maxY = containerHeight - imageSize;

            const randomX = Math.random() * maxX;
            const randomY = Math.random() * maxY;
            const randomRotate = Math.random() * 40 - 20; // -20deg to 20deg
            const randomDelay = Math.random() * 0.5;

            return (
              <motion.div
                key={image.id}
                drag
                dragConstraints={{
                  left: 0,
                  right: maxX,
                  top: 0,
                  bottom: maxY
                }}
                dragElastic={0.1}
                dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={() => {
                  // Delay to prevent click event after drag
                  setTimeout(() => setIsDragging(false), 100);
                }}
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: maxX / 2,
                  y: maxY / 2,
                  rotate: 0
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: randomX,
                  y: randomY,
                  rotate: randomRotate
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{
                  duration: 0.8,
                  delay: randomDelay,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{
                  scale: 1.05,
                  zIndex: 10,
                  cursor: 'grab'
                }}
                whileDrag={{
                  scale: 1.1,
                  rotate: randomRotate + 10,
                  zIndex: 20,
                  cursor: 'grabbing',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                }}
                onClick={() => {
                  if (!isDragging) {
                    setSelectedImage(image);
                  }
                }}
                className="absolute w-48 h-48 lg:w-64 lg:h-64 bg-white rounded-lg shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing"
              >
                <div className="relative w-full h-full bg-gray-200 pointer-events-none">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    sizes="300px"
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
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-black mb-2">
          Gallery
        </h1>
        <p className="text-gray-600 text-lg">
          Some moments captured just for you
        </p>
      </div>

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
