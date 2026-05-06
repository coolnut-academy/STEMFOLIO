"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { Clock } from 'lucide-react';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, userDoc, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userDoc?.status === 'approved') {
        router.push(userDoc.role === 'admin' ? '/admin' : '/student');
      } else if (userDoc?.status === 'rejected') {
        router.push('/rejected');
      } else if (!userDoc?.name || !userDoc?.classRoom) {
        router.push('/complete-profile');
      }
    }
  }, [user, userDoc, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="cyber-spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden page-transition">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="login-blob-1" />
        <div className="login-blob-3" />
      </div>
      <div className="star-field" />

      <div className="relative z-10 w-full max-w-md
        bg-[rgba(255,255,255,0.065)] backdrop-blur-[40px]
        border border-[rgba(255,255,255,0.10)]
        rounded-[var(--radius-card)]
        shadow-[0_24px_72px_rgba(0,0,0,0.55)]
        p-10 text-center flex flex-col items-center">

        <div className="w-16 h-16 rounded-2xl
          bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.25)]
          flex items-center justify-center mb-6
          shadow-[0_4px_20px_rgba(245,158,11,0.18)]">
          <Clock className="w-8 h-8 text-[#fcd34d]" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">รอการอนุมัติ</h1>
        <p className="text-white/70 mb-8 text-sm leading-relaxed">
          ข้อมูลของคุณถูกส่งไปยังผู้ดูแลระบบเรียบร้อยแล้ว<br/>
          กรุณารอการอนุมัติเพื่อเข้าใช้งานระบบ
        </p>

        <Button variant="outline" className="w-full" onClick={handleSignOut}>
          ออกจากระบบ
        </Button>
      </div>
    </div>
  );
}
