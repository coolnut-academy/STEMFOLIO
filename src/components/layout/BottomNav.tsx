"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, Folder, FolderHeart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const BottomNav = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const adminLinks = [
    { href: '/admin',          label: 'ภาพรวม', icon: LayoutDashboard },
    { href: '/admin/students', label: 'นักเรียน', icon: Users },
    { href: '/admin/advisors', label: 'ครู',      icon: UserCog },
    { href: '/admin/projects', label: 'โครงงาน',  icon: Folder },
  ];

  const studentLinks = [
    { href: '/student', label: 'โครงงาน', icon: FolderHeart },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[rgba(8,12,30,0.95)] backdrop-blur-xl border-t border-slate-200/80 dark:border-white/8 pb-safe">
      {/* Top shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300/40 dark:via-[rgba(0,102,255,0.25)] to-transparent pointer-events-none" />

      <div className="flex justify-around items-center h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                active
                  ? 'text-[#0066FF] dark:text-[#4D9FFF]'
                  : 'text-slate-400 dark:text-white/28 hover:text-slate-600 dark:hover:text-white/55'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#0066FF] shadow-[0_0_4px_rgba(0,102,255,0.6)]" />
                )}
              </div>
              <span className={`text-[9px] font-mono uppercase tracking-wider ${active ? 'font-bold' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
