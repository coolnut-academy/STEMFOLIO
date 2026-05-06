"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, Folder, FolderHeart, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const adminLinks = [
    { href: '/admin',           label: 'Dashboard',    icon: LayoutDashboard },
    { href: '/admin/students',  label: 'นักเรียน',     icon: Users },
    { href: '/admin/advisors',  label: 'ครูที่ปรึกษา', icon: UserCog },
    { href: '/admin/projects',  label: 'โครงงาน',      icon: Folder },
  ];

  const studentLinks = [
    { href: '/student', label: 'โครงงานของฉัน', icon: FolderHeart },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 z-40 bg-white/90 dark:bg-[rgba(8,12,30,0.95)] backdrop-blur-xl border-r border-slate-200/80 dark:border-white/8">

      {/* Vertical accent line */}
      <div className="absolute right-0 top-[10%] bottom-[10%] w-px bg-gradient-to-b from-transparent via-blue-300/40 dark:via-[rgba(0,102,255,0.25)] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-white/6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[rgba(0,102,255,0.12)] border border-blue-200 dark:border-[rgba(0,102,255,0.30)] flex items-center justify-center shadow-[0_2px_8px_rgba(0,102,255,0.12)]">
            <Zap className="w-4 h-4 text-[#0066FF]" />
          </div>
          <span className="text-lg font-black tracking-widest gradient-text">STEMFOLIO</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
          <span className="text-[9px] font-mono text-slate-400 dark:text-white/25 uppercase tracking-[0.2em]">System Online</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(`${href}/`)) || (href === '/admin' && pathname === '/admin');

          return (
            <Link
              key={href}
              href={href}
              className={`
                relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200
                ${active
                  ? 'bg-blue-50 dark:bg-[rgba(0,102,255,0.10)] border border-blue-200 dark:border-[rgba(0,102,255,0.30)] text-[#0066FF] dark:text-[#4D9FFF] shadow-[0_2px_8px_rgba(0,102,255,0.10)]'
                  : 'border border-transparent text-slate-400 dark:text-white/35 hover:text-slate-700 dark:hover:text-white/75 hover:bg-slate-50 dark:hover:bg-[rgba(255,255,255,0.04)] hover:border-slate-200/60 dark:hover:border-[rgba(255,255,255,0.06)]'}
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className={`text-sm ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0066FF] shadow-[0_0_6px_rgba(0,102,255,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom decoration */}
      <div className="px-6 py-4 border-t border-slate-100 dark:border-white/6">
        <p className="text-[9px] font-mono text-slate-300 dark:text-white/15 uppercase tracking-[0.2em]">
          STEMFOLIO v0.1.0
        </p>
      </div>
    </aside>
  );
};
