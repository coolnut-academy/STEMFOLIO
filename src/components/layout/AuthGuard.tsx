"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '../ui/Spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'student')[];
}

export const AuthGuard = ({ children, allowedRoles }: AuthGuardProps) => {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in -> redirect to login, save return url if needed
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (allowedRoles && role && !allowedRoles.includes(role as any)) {
        // Logged in but wrong role -> redirect to their home dashboard
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/student');
        }
      }
    }
  }, [user, role, loading, router, pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#d5dce6]">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="w-10 h-10 text-[var(--accent-blue)]" />
          <p className="text-gray-500 font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // If user is not present or doesn't have the right role, don't render children
  // (The useEffect will handle redirection)
  if (!user || (allowedRoles && role && !allowedRoles.includes(role as any))) {
    return null;
  }

  return <>{children}</>;
};
