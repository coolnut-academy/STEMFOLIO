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
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape')      onClose();
      if (e.key === 'ArrowLeft')   onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight')  onNavigate((currentIndex + 1) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, currentIndex, images.length, onClose, onNavigate]);

  if (!isOpen || images.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(2,0,12,0.96)] backdrop-blur-md animate-in fade-in duration-200">
      {/* Close */}
      <button
        type="button"
        aria-label="ปิด"
        onClick={onClose}
        className="absolute top-5 right-5 p-2.5 rounded-xl border border-[rgba(0,212,255,0.20)] text-white/40 hover:text-[var(--neon-cyan)] hover:border-[rgba(0,212,255,0.50)] hover:bg-[rgba(0,212,255,0.08)] transition-all z-10"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          type="button"
          aria-label="ภาพก่อนหน้า"
          onClick={() => onNavigate((currentIndex - 1 + images.length) % images.length)}
          className="absolute left-5 p-3 rounded-xl border border-[rgba(0,212,255,0.20)] text-white/40 hover:text-[var(--neon-cyan)] hover:border-[rgba(0,212,255,0.50)] hover:bg-[rgba(0,212,255,0.08)] transition-all"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {/* Image */}
      <div className="relative w-full max-w-5xl max-h-[88vh] px-20 flex flex-col items-center justify-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex]}
          alt={`ภาพที่ ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-[0_0_60px_rgba(0,212,255,0.12)] animate-in zoom-in-95 duration-200"
        />
        {images.length > 1 && (
          <span className="text-xs font-mono text-white/30">
            {currentIndex + 1} / {images.length}
          </span>
        )}
      </div>

      {/* Next */}
      {images.length > 1 && (
        <button
          type="button"
          aria-label="ภาพถัดไป"
          onClick={() => onNavigate((currentIndex + 1) % images.length)}
          className="absolute right-5 p-3 rounded-xl border border-[rgba(0,212,255,0.20)] text-white/40 hover:text-[var(--neon-cyan)] hover:border-[rgba(0,212,255,0.50)] hover:bg-[rgba(0,212,255,0.08)] transition-all"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}
    </div>
  );
};
