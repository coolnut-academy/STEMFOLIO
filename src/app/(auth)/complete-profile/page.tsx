"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { updateProfile } from '@/lib/auth';
import { Spinner } from '@/components/ui/Spinner';
import Image from 'next/image';

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
        status: 'pending',
      });
      showToast('บันทึกข้อมูลสำเร็จ รอการอนุมัติจากผู้ดูแลระบบ', 'success');
      window.location.href = '/pending-approval';
    } catch (error: unknown) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="cyber-spinner w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-10 relative overflow-hidden page-transition">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="login-blob-1" />
        <div className="login-blob-2" />
      </div>
      <div className="star-field" />

      <div className="relative z-10 w-full max-w-xl
        bg-[rgba(255,255,255,0.065)] backdrop-blur-[40px]
        border border-[rgba(255,255,255,0.10)]
        rounded-[var(--radius-card)]
        shadow-[0_24px_72px_rgba(0,0,0,0.55)]
        p-8">

        <div className="text-center mb-8">
          <div className="mx-auto mb-4 drop-shadow-[0_4px_16px_rgba(99,102,241,0.40)]">
            <Image
              src="/logo.png"
              alt="STEMFOLIO"
              width={72}
              height={72}
              priority
              className="rounded-full"
            />
          </div>
          <h1 className="text-xl font-bold text-white mb-1.5">ข้อมูลส่วนตัว</h1>
          <p className="text-white/65 text-sm">กรอกข้อมูลให้ครบถ้วนเพื่อส่งให้ผู้ดูแลระบบอนุมัติ</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="ชื่อ-นามสกุล *"
            placeholder="สมชาย ใจดี"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="border-t border-[rgba(255,255,255,0.08)] my-1" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/60">
            ข้อมูลสำหรับการแข่งขัน
          </p>

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
            className="w-full mt-2 h-11"
            loading={isLoading}
          >
            {isLoading ? 'กำลังบันทึก…' : 'บันทึกและส่งข้อมูล'}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="cyber-spinner w-8 h-8" />
      </div>
    }>
      <CompleteProfileContent />
    </Suspense>
  );
}
