'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  onPrevious?: () => void;
  onNext?: () => void;
  showNavigation?: boolean;
}

export default function Modal({ isOpen, onClose, children, title, onPrevious, onNext, showNavigation = false }: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-90" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-6xl transform overflow-hidden rounded-lg bg-white shadow-2xl transition-all">
                {/* Header - only show if title exists */}
                {title && (
                  <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <Dialog.Title className="text-lg font-semibold text-black">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="ml-auto rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-black"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                )}

                {/* Close button for no-title modals */}
                {!title && (
                  <button
                    type="button"
                    className="absolute top-4 right-4 z-10 rounded-md bg-black/50 p-2 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                )}

                {/* Content */}
                <div className="relative">
                  {children}

                  {/* Navigation arrows */}
                  {showNavigation && (
                    <>
                      {/* Previous button */}
                      {onPrevious && (
                        <button
                          type="button"
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                          onClick={onPrevious}
                        >
                          <span className="sr-only">Previous image</span>
                          <ChevronLeftIcon className="h-8 w-8" aria-hidden="true" />
                        </button>
                      )}

                      {/* Next button */}
                      {onNext && (
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-black/50 p-3 text-white hover:bg-black/70 focus:outline-none focus:ring-2 focus:ring-white transition-all"
                          onClick={onNext}
                        >
                          <span className="sr-only">Next image</span>
                          <ChevronRightIcon className="h-8 w-8" aria-hidden="true" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
