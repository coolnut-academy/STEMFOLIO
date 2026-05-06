"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { Zap } from 'lucide-react';

function LoginContent() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithGoogle, user, userDoc, role } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (user && userDoc) {
      const complete = userDoc.name && userDoc.classRoom && userDoc.studentId;
      if (!complete) { router.push('/complete-profile'); return; }
      if (userDoc.status === 'pending'   && role !== 'admin') { router.push('/pending-approval'); return; }
      if (userDoc.status === 'rejected'  && role !== 'admin') { router.push('/rejected'); return; }
      const redirect = searchParams?.get('redirect');
      router.push(redirect || (role === 'admin' ? '/admin' : '/student'));
    }
  }, [user, userDoc, role, router, searchParams]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch {
      showToast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden page-transition">

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="login-blob-1" />
        <div className="login-blob-2" />
        <div className="login-blob-3" />
      </div>

      {/* Grid overlay */}
      <div className="login-grid" />

      {/* Login Card */}
      <div className="relative w-full max-w-sm">

        {/* Holographic border wrapper */}
        <div className="holo-border rounded-[20px]">
          <div className="
            relative bg-white/90 dark:bg-[rgba(8,12,30,0.92)] backdrop-blur-2xl
            rounded-[20px] p-10 text-center
            border border-white/60 dark:border-white/4
            shadow-[0_20px_60px_rgba(0,66,180,0.12),0_4px_12px_rgba(0,0,0,0.04)]
            dark:shadow-[0_20px_60px_rgba(0,0,0,0.50)]
          ">
            {/* Corner brackets */}
            <span className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-blue-200 dark:border-[rgba(0,102,255,0.5)] rounded-tl-sm" />
            <span className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-blue-200 dark:border-[rgba(0,102,255,0.5)] rounded-tr-sm" />
            <span className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-blue-200 dark:border-[rgba(0,102,255,0.5)] rounded-bl-sm" />
            <span className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-blue-200 dark:border-[rgba(0,102,255,0.5)] rounded-br-sm" />

            {/* Logo */}
            <div className="mb-8 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-[rgba(0,102,255,0.12)] border border-blue-200 dark:border-[rgba(0,102,255,0.35)] flex items-center justify-center shadow-[0_4px_20px_rgba(0,102,255,0.18)] float-anim">
                <Zap className="w-7 h-7 text-[#0066FF]" />
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-[0.15em] gradient-text mb-1">
                  STEMFOLIO
                </h1>
                <p className="text-[10px] font-mono text-slate-400 dark:text-white/28 uppercase tracking-[0.25em]">
                  Project Lifecycle System
                </p>
              </div>
            </div>

            {/* Status line */}
            <div className="flex items-center justify-center gap-1.5 mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              <span className="text-[10px] font-mono text-slate-400 dark:text-white/25 tracking-widest uppercase">Auth Gateway Online</span>
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleLogin}
              className="w-full h-12 text-sm font-semibold gap-3 !justify-center"
              loading={isLoading}
            >
              {!isLoading && (
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1,0,0,1,27.009,-39.239)">
                    <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                    <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                    <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                    <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                  </g>
                </svg>
              )}
              เข้าสู่ระบบด้วย Google
            </Button>

            <p className="mt-6 text-[10px] font-mono text-slate-400 dark:text-white/18 leading-relaxed">
              เฉพาะนักเรียนและครูที่ได้รับอนุญาตเท่านั้น
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <span className="cyber-spinner w-8 h-8" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
