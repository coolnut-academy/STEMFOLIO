"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, Folder, FolderHeart, X } from 'lucide-react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { role } = useAuth();

  const adminLinks = [
    { href: '/admin',           label: 'ภาพรวม',       icon: LayoutDashboard },
    { href: '/admin/students',  label: 'นักเรียน',     icon: Users },
    { href: '/admin/advisors',  label: 'ครูที่ปรึกษา', icon: UserCog },
    { href: '/admin/projects',  label: 'โครงงาน',      icon: Folder },
  ];

  const studentLinks = [
    { href: '/student', label: 'โครงงานของฉัน', icon: FolderHeart },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`
        fixed left-0 top-0 z-50 flex flex-col w-60 h-screen
        bg-[rgba(6,9,24,0.97)] backdrop-blur-[40px]
        border-r border-[rgba(255,255,255,0.06)]
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Vertical accent line */}
        <div className="absolute right-0 top-[12%] bottom-[12%] w-px bg-gradient-to-b from-transparent via-[rgba(99,102,241,0.22)] to-transparent pointer-events-none" />

        {/* Logo */}
        <div className="px-5 py-5 border-b border-[rgba(255,255,255,0.05)]">
          <div className="flex items-center gap-3">
            <div className="shrink-0 drop-shadow-[0_2px_8px_rgba(99,102,241,0.40)]">
              <Image
                src="/logo.png"
                alt="STEMFOLIO"
                width={34}
                height={34}
                className="rounded-full"
              />
            </div>
            <span className="font-brand text-base font-black tracking-[0.18em] gradient-text">
              STEMFOLIO
            </span>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto md:hidden flex items-center justify-center w-7 h-7 rounded-lg text-white/45 hover:text-white/80 hover:bg-[rgba(255,255,255,0.07)] transition-all"
              aria-label="ปิดเมนู"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 pl-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.65)]" />
            <span className="text-[9px] font-semibold text-white/45 uppercase tracking-[0.2em]">
              System Online
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {links.map(({ href, label, icon: Icon }) => {
            const active =
              pathname === href ||
              (href !== '/admin' && pathname.startsWith(`${href}/`)) ||
              (href === '/admin' && pathname === '/admin');

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-150
                  ${active
                    ? 'bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.22)] text-[#c7d2fe]'
                    : 'border border-transparent text-white/55 hover:text-white/90 hover:bg-[rgba(255,255,255,0.05)] hover:border-[rgba(255,255,255,0.08)]'}
                `}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className={`text-[13px] ${active ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#818cf8] shadow-[0_0_6px_rgba(129,140,248,0.65)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.05)]">
          <p className="text-[9px] font-semibold text-white/35 uppercase tracking-[0.22em]">
            STEMFOLIO v0.1.0
          </p>
        </div>
      </aside>
    </>
  );
};
