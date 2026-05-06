"use client";

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <GlassCard 
        className={`relative w-full ${maxWidth} transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200`}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)]">
          {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200/50 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </GlassCard>
    </div>
  );
};
