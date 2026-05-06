"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';
interface ToastItem { id: string; type: ToastType; message: string; }
interface ToastContextType { showToast: (message: string, type?: ToastType) => void; }

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const cfg = {
  success: { border: 'border-emerald-200', bar: 'bg-emerald-500', icon: <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> },
  error:   { border: 'border-rose-200',    bar: 'bg-rose-500',    icon: <AlertCircle  className="w-4 h-4 text-rose-500   shrink-0" /> },
  info:    { border: 'border-blue-200',    bar: 'bg-blue-500',    icon: <Info         className="w-4 h-4 text-blue-500   shrink-0" /> },
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(p => [...p, { id, type, message }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3400);
  }, []);

  const remove = (id: string) => setToasts(p => p.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2.5 pointer-events-none">
        {toasts.map(toast => {
          const c = cfg[toast.type];
          return (
            <div key={toast.id} className={`
              pointer-events-auto relative overflow-hidden
              flex items-center gap-3 pl-4 pr-3 py-3
              bg-white/96 dark:bg-[rgba(8,12,30,0.95)]
              backdrop-blur-xl
              border ${c.border} dark:border-white/10
              shadow-[0_8px_30px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]
              rounded-xl min-w-[260px] max-w-[360px]
              animate-in slide-in-from-right-4 fade-in duration-300
            `}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar}`} />
              {c.icon}
              <p className="text-sm text-slate-700 dark:text-slate-200 flex-1 font-medium">{toast.message}</p>
              <button
                type="button"
                aria-label="ปิดการแจ้งเตือน"
                onClick={() => remove(toast.id)}
                className="text-slate-300 hover:text-slate-500 dark:text-white/25 dark:hover:text-white/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
