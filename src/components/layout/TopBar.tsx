"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, ChevronDown, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopBarProps {
  title?: string;
  onMenuToggle?: () => void;
}

export const TopBar = ({ title, onMenuToggle }: TopBarProps) => {
  const { user, userDoc, signOut } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  const initial = userDoc?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-7
      bg-[rgba(6,9,24,0.75)] backdrop-blur-[24px]
      border-b border-[rgba(255,255,255,0.06)]">

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(99,102,241,0.22)] to-transparent pointer-events-none" />

      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={onMenuToggle}
          aria-label="เปิดเมนู"
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-[5px] rounded-lg
            hover:bg-[rgba(255,255,255,0.06)] transition-colors shrink-0"
        >
          <Menu className="w-5 h-5 text-white/70" />
        </button>

        <h2 className="font-brand text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
          {title || 'STEMFOLIO'}
        </h2>
      </div>

      <div className="flex items-center gap-2.5">
        <ThemeToggle />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen(v => !v)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl
              border border-[rgba(255,255,255,0.08)]
              hover:border-[rgba(99,102,241,0.35)] hover:bg-[rgba(99,102,241,0.08)]
              transition-all duration-200"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center text-white font-bold text-xs shadow-[0_2px_8px_rgba(99,102,241,0.32)]">
              {initial}
            </div>
            <span className="text-xs font-medium text-white/70 hidden sm:block max-w-[120px] truncate">
              {userDoc?.name || user?.email}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-white/45 hidden sm:block" />
          </button>

          {menuOpen && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-52 z-50
                bg-[rgba(10,13,35,0.96)] backdrop-blur-[24px]
                border border-[rgba(255,255,255,0.10)]
                rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.55)]
                py-1">
                <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.06)] sm:hidden">
                  <p className="text-xs font-medium text-white/80 truncate">{userDoc?.name || 'User'}</p>
                  <p className="text-[10px] text-white/55 truncate">{user?.email}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#f87171]
                    hover:bg-[rgba(239,68,68,0.10)]
                    flex items-center gap-2.5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  ออกจากระบบ
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
