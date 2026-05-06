"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { updateProfile } from '@/lib/auth';
import { Spinner } from '@/components/ui/Spinner';

function CompleteProfileContent() {
  const [name, setName] = useState('');
  const [classRoom, setClassRoom] = useState('');
  const [studentId, setStudentId] = useState('');
  const [nickname, setNickname] = useState('');
  const [competitionEmail, setCompetitionEmail] = useState('');
  const [competitionPhone, setCompetitionPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const router = useRouter();
  const { user, userDoc, loading } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (userDoc?.name && userDoc?.classRoom && userDoc?.studentId) {
        if (userDoc.status === 'pending') {
          router.push('/pending-approval');
        } else {
          router.push('/student');
        }
      } else {
        if (userDoc?.name) setName(userDoc.name);
        if (user?.displayName && !userDoc?.name) setName(user.displayName);
        setInitialLoading(false);
      }
    }
  }, [user, userDoc, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !classRoom || !studentId || !competitionEmail || !competitionPhone) {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(user!.uid, {
        name,
        classRoom,
        studentId,
        nickname,
        competitionEmail,
        competitionPhone,
        status: 'pending' // Still pending approval
      });
      showToast('บันทึกข้อมูลสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ', 'success');
      
      // Force reload to get updated context
      window.location.href = '/pending-approval';
    } catch (error: any) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || initialLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-8 h-8 text-blue-500" /></div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 page-transition py-10">
      <GlassCard className="w-full max-w-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ข้อมูลส่วนตัว</h1>
          <p className="text-gray-500">กรอกข้อมูลให้ครบถ้วนเพื่อส่งให้ผู้ดูแลระบบอนุมัติการเข้าใช้งาน</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input 
            label="ชื่อ-นามสกุล *" 
            placeholder="สมชาย ใจดี"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input 
              label="ระดับชั้น / ห้อง *" 
              placeholder="เช่น ม.5/1"
              value={classRoom}
              onChange={(e) => setClassRoom(e.target.value)}
              disabled={isLoading}
              required
            />
            <Input 
              label="เลขที่ *" 
              placeholder="เช่น 12"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Input 
            label="ชื่อเล่น" 
            placeholder="ชาย"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            disabled={isLoading}
          />

          <hr className="my-2 border-gray-200" />
          <h3 className="font-semibold text-gray-800">ข้อมูลสำหรับการแข่งขัน</h3>

          <Input 
            label="Email สำหรับส่งแข่งขัน *" 
            type="email"
            placeholder="student@school.ac.th"
            value={competitionEmail}
            onChange={(e) => setCompetitionEmail(e.target.value)}
            disabled={isLoading}
            required
          />
          <Input 
            label="เบอร์โทรศัพท์ *" 
            type="tel"
            placeholder="08X-XXX-XXXX"
            value={competitionPhone}
            onChange={(e) => setCompetitionPhone(e.target.value)}
            disabled={isLoading}
            required
          />
          
          <Button 
            type="submit" 
            className="w-full mt-4 h-12 text-lg" 
            loading={isLoading}
          >
            บันทึกและส่งข้อมูล
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading...</div>}>
      <CompleteProfileContent />
    </Suspense>
  );
}
