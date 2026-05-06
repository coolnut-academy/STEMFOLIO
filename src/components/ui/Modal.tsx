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
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className={`
        relative w-full ${maxWidth}
        bg-white/92 dark:bg-[rgba(8,12,30,0.92)]
        backdrop-blur-[48px] backdrop-saturate-[180%]
        border border-slate-200/80 dark:border-white/10
        rounded-[var(--radius-card)]
        shadow-[0_20px_60px_rgba(0,66,180,0.14),0_4px_12px_rgba(0,0,0,0.06)]
        dark:shadow-[0_20px_60px_rgba(0,0,0,0.50)]
        animate-in fade-in zoom-in-95 duration-200
        overflow-hidden
      `}>
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0066FF]/40 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-white/6">
          {title && (
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิด"
            className="ml-auto p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-white/8 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};
