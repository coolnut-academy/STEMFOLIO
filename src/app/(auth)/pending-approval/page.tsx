"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
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
    return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-8 h-8 text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-transition">
      <GlassCard className="w-full max-w-md p-10 text-center flex flex-col items-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
          <Clock className="w-10 h-10 text-blue-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">รอการอนุมัติ</h1>
        <p className="text-gray-500 mb-8">
          ข้อมูลของคุณถูกส่งไปยังผู้ดูแลระบบเรียบร้อยแล้ว<br/>กรุณารอการอนุมัติเพื่อเข้าใช้งานระบบ
        </p>

        <Button 
          variant="secondary" 
          className="w-full"
          onClick={handleSignOut}
        >
          ลงชื่อออก
        </Button>
      </GlassCard>
    </div>
  );
}
