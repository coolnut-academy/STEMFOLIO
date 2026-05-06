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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40
      bg-[rgba(6,9,24,0.95)] backdrop-blur-[24px]
      border-t border-[rgba(255,255,255,0.07)]
      pb-safe">

      {/* Top shimmer */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(99,102,241,0.22)] to-transparent pointer-events-none" />

      <div className="flex justify-around items-center h-16">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                active
                  ? 'text-[#818cf8]'
                  : 'text-white/52 hover:text-white/80'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#818cf8] shadow-[0_0_5px_rgba(129,140,248,0.7)]" />
                )}
              </div>
              <span className={`text-[9px] uppercase tracking-wider ${active ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
