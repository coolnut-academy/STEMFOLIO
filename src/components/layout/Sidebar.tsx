"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, UserCog, Folder, FolderHeart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const Sidebar = () => {
  const pathname = usePathname();
  const { role } = useAuth();

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/students', label: 'นักเรียน', icon: Users },
    { href: '/admin/advisors', label: 'ครูที่ปรึกษา', icon: UserCog },
    { href: '/admin/projects', label: 'โครงงาน', icon: Folder },
  ];

  const studentLinks = [
    { href: '/student', label: 'โครงงานของฉัน', icon: FolderHeart },
  ];

  const links = role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[var(--glass-bg)] backdrop-blur-md border-r border-[var(--glass-border)] z-40">
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
          STEMFOLIO
        </h1>
      </div>
      
      <nav className="flex-1 px-4 flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
          
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-[var(--radius-button)] transition-all
                ${isActive 
                  ? 'bg-[var(--accent-blue)] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-[var(--glass-bg-hover)] hover:text-gray-900'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
