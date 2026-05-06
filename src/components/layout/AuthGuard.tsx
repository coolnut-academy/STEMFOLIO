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
  const { user, userDoc, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    if (userDoc) {
      // Admins bypass profile-completion and status checks
      if (role === 'admin') {
        if (allowedRoles && !allowedRoles.includes('admin')) {
          router.push('/admin');
        }
        return;
      }

      // Student checks
      const isProfileComplete = userDoc.name && userDoc.classRoom && userDoc.studentId;
      if (!isProfileComplete) {
        router.push('/complete-profile');
      } else if (userDoc.status === 'pending') {
        router.push('/pending-approval');
      } else if (userDoc.status === 'rejected') {
        router.push('/rejected');
      } else if (allowedRoles && role && !allowedRoles.includes(role as 'admin' | 'student')) {
        router.push('/student');
      }
    }
  }, [user, userDoc, role, loading, router, pathname, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="cyber-spinner w-10 h-10" />
          <p className="text-white/55 font-medium text-sm">กำลังโหลดข้อมูล…</p>
        </div>
      </div>
    );
  }

  // Block render while redirects are in-flight
  if (!user) return null;

  if (role === 'admin') {
    // Admins can access anything unless explicitly excluded
    if (allowedRoles && !allowedRoles.includes('admin')) return null;
    return <>{children}</>;
  }

  // Student render guard
  const isProfileComplete = userDoc?.name && userDoc?.classRoom && userDoc?.studentId;
  if (
    !userDoc ||
    !isProfileComplete ||
    userDoc.status === 'pending' ||
    userDoc.status === 'rejected' ||
    (allowedRoles && role && !allowedRoles.includes(role as 'admin' | 'student'))
  ) {
    return null;
  }

  return <>{children}</>;
};
