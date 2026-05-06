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
    if (!loading) {
      if (!user) {
        // Not logged in -> redirect to login, save return url if needed
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      } else if (userDoc) {
        const isProfileComplete = userDoc.name && userDoc.classRoom && userDoc.studentId;
        if (!isProfileComplete) {
          router.push('/complete-profile');
        } else if (userDoc.status === 'pending' && role !== 'admin') {
          router.push('/pending-approval');
        } else if (userDoc.status === 'rejected' && role !== 'admin') {
          router.push('/rejected');
        } else if (allowedRoles && role && !allowedRoles.includes(role as any)) {
          // Logged in but wrong role -> redirect to their home dashboard
          if (role === 'admin') {
            router.push('/admin');
          } else {
            router.push('/student');
          }
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

  const isProfileComplete = userDoc?.name && userDoc?.classRoom && userDoc?.studentId;

  if (
    !user || 
    !userDoc || 
    !isProfileComplete || 
    (userDoc.status === 'pending' && role !== 'admin') || 
    (userDoc.status === 'rejected' && role !== 'admin') || 
    (allowedRoles && role && !allowedRoles.includes(role as any))
  ) {
    return null;
  }

  return <>{children}</>;
};
