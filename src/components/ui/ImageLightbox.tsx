"use client";

import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageLightboxProps {
  isOpen: boolean;
  images: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const ImageLightbox = ({ isOpen, images, currentIndex, onClose, onNavigate }: ImageLightboxProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % images.length);
    };

    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-10"
      >
        <X className="w-8 h-8" />
      </button>

      {images.length > 1 && (
        <button 
          onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
          className="absolute left-6 p-2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-10 h-10" />
        </button>
      )}

      <div className="relative w-full max-w-5xl max-h-[85vh] px-16 flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={images[currentIndex]} 
          alt={`Image ${currentIndex + 1}`}
          className="max-w-full max-h-[85vh] object-contain animate-in zoom-in-95 duration-200"
        />
        
        {images.length > 1 && (
          <div className="absolute bottom-[-40px] left-0 right-0 text-center text-white/70 text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <button 
          onClick={() => onNavigate((currentIndex + 1) % images.length)}
          className="absolute right-6 p-2 text-white/70 hover:text-white transition-colors"
        >
          <ChevronRight className="w-10 h-10" />
        </button>
      )}
    </div>
  );
};
