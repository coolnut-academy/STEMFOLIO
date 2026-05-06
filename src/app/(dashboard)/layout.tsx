import React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TopBar } from '@/components/layout/TopBar';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#f5f7fa] via-[#e4e9f2] to-[#d5dce6] flex">
        {/* Desktop Sidebar */}
        <Sidebar />
        
        <div className="flex-1 flex flex-col md:ml-64 pb-20 md:pb-0">
          <TopBar />
          
          <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
            {children}
          </main>
          
          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </div>
      </div>
    </AuthGuard>
  );
}
