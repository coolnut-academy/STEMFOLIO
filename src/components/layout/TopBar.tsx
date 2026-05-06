"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopBarProps {
  title?: string;
}

export const TopBar = ({ title }: TopBarProps) => {
  const { user, userDoc, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const initial = userDoc?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-[rgba(8,12,30,0.90)] backdrop-blur-xl border-b border-slate-200/80 dark:border-white/8 px-4 md:px-8 flex items-center justify-between">
      {/* Bottom border shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 dark:via-[rgba(0,102,255,0.25)] to-transparent pointer-events-none" />

      <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
        {title || 'STEMFOLIO'}
      </h2>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-[rgba(0,102,255,0.15)] hover:border-blue-300 dark:hover:border-[rgba(0,102,255,0.40)] hover:bg-blue-50 dark:hover:bg-[rgba(0,102,255,0.06)] transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#6366F1] flex items-center justify-center text-white font-black text-xs shadow-[0_2px_8px_rgba(0,102,255,0.25)]">
              {initial}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-white/50 hidden sm:block max-w-[120px] truncate">
              {userDoc?.name || user?.email}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300 dark:text-white/25 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white/96 dark:bg-[rgba(8,12,30,0.96)] backdrop-blur-xl border border-slate-200/80 dark:border-[rgba(0,102,255,0.18)] rounded-xl shadow-[0_8px_30px_rgba(0,66,180,0.12),0_2px_8px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.5)] py-1 animate-in fade-in zoom-in-95 duration-150 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-white/6 sm:hidden">
                <p className="text-xs font-medium text-slate-600 dark:text-white/60 truncate">{userDoc?.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 dark:text-white/30 truncate">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-[rgba(255,0,110,0.08)] flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
