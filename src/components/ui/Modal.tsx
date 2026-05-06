"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(3,4,14,0.70)] backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        relative w-full ${maxWidth}
        bg-[rgba(12,15,38,0.96)] backdrop-blur-[48px]
        border border-[rgba(255,255,255,0.10)]
        rounded-[var(--radius-card)]
        shadow-[0_24px_72px_rgba(0,0,0,0.60)]
        overflow-hidden
      `}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(99,102,241,0.40)] to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
          {title && (
            <h3 className="text-sm font-semibold text-white/88 tracking-wide">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="ml-auto p-1.5 rounded-lg text-white/40 hover:text-white/75 hover:bg-[rgba(255,255,255,0.07)] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
