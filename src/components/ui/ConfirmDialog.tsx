"use client";

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDanger?: boolean;
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก',
  onConfirm,
  onCancel,
  isDanger = false,
  isLoading = false,
  children,
}: ConfirmDialogProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <div className="flex flex-col gap-6">
        <p className="text-white/70">{message}</p>
        {children}
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button 
            variant={isDanger ? 'danger' : 'primary'} 
            onClick={onConfirm} 
            loading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
