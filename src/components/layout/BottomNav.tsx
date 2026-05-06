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
    { href: '/admin', label: 'ภาพรวม', icon: LayoutDashboard },
    { href: '/admin/students', label: 'นักเรียน', icon: Users },
    { href: '/admin/advisors', label: 'ครู', icon: UserCog },
    { href: '/admin/projects', label: 'โครงงาน', icon: Folder },
  ];

  const studentLinks = [
    { href: '/student', label: 'โครงงานของฉัน', icon: FolderHeart },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[var(--glass-bg)] backdrop-blur-md border-t border-[var(--glass-border)] pb-safe z-40">
      <div className="flex justify-around items-center h-16">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`
                flex flex-col items-center justify-center w-full h-full gap-1
                ${isActive ? 'text-[var(--accent-blue)]' : 'text-gray-500'}
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'animate-bounce-short' : ''}`} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
