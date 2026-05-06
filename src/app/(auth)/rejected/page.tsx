"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { XCircle } from 'lucide-react';

export default function RejectedPage() {
  const router = useRouter();
  const { user, userDoc, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userDoc?.status === 'approved') {
        router.push(userDoc.role === 'admin' ? '/admin' : '/student');
      } else if (userDoc?.status === 'pending') {
        router.push('/pending-approval');
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
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ไม่อนุมัติการใช้งาน</h1>
        <p className="text-gray-500 mb-8">
          ข้อมูลของคุณไม่ได้รับการอนุมัติจากผู้ดูแลระบบ<br/>กรุณาติดต่อครูที่ปรึกษาหรือผู้ดูแลระบบ
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
