"use client";

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';

export const DashboardShell = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col md:ml-60 pb-20 md:pb-0 min-w-0">
        <TopBar onMenuToggle={() => setSidebarOpen(v => !v)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full page-transition">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};
