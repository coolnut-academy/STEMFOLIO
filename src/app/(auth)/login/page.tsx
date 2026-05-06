"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Suspense } from 'react';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, role } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    // Already logged in
    if (user && role) {
      const redirect = searchParams?.get('redirect');
      if (redirect) {
        router.push(redirect);
      } else {
        router.push(role === 'admin' ? '/admin' : '/student');
      }
    }
  }, [user, role, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('กรุณากรอกอีเมลและรหัสผ่าน', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(email, password);
      // Let the useEffect handle the redirect based on role
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showToast('อีเมลหรือรหัสผ่านไม่ถูกต้อง', 'error');
      } else {
        showToast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] bg-clip-text text-transparent">
            STEMFOLIO
          </h1>
          <p className="text-gray-500 mt-2">เข้าสู่ระบบเพื่อจัดการโครงงานของคุณ</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Input 
            label="อีเมล" 
            type="email" 
            placeholder="example@school.ac.th"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          <Input 
            label="รหัสผ่าน" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            className="w-full mt-2" 
            loading={isLoading}
          >
            เข้าสู่ระบบ
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          นักเรียนที่ต้องการเข้าร่วมโครงงานใหม่?{' '}
          <Link href="/join" className="text-[var(--accent-blue)] font-medium hover:underline">
            ใช้ Invite Code ที่นี่
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center p-4">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
