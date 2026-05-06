"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';

export default function RootPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user && role) {
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/student');
        }
      } else {
        router.push('/login');
      }
    }
  }, [user, role, loading, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f5f7fa] to-[#d5dce6]">
      <Spinner className="w-12 h-12 text-[var(--accent-blue)]" />
    </main>
  );
}
