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

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--glass-bg)] backdrop-blur-md border-b border-[var(--glass-border)] px-4 md:px-8 flex items-center justify-between transition-colors">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title || 'STEMFOLIO'}</h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="relative">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 hover:bg-[var(--glass-bg-hover)] p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-[var(--glass-border)]"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {userDoc?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:block">
              {userDoc?.name || user?.email}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400 hidden sm:block" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1e] border border-gray-100 dark:border-white/10 rounded-xl shadow-lg py-1 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-gray-50 dark:border-white/5 sm:hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userDoc?.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors"
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
