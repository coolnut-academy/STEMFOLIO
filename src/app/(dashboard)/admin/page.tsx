"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/ui/GlassCard';

export default function AdminDashboardPage() {
  const { userDoc } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ (Admin Dashboard)</h1>
          <p className="text-gray-500">ยินดีต้อนรับ, {userDoc?.name || 'ผู้ดูแลระบบ'}</p>
        </div>
      </div>

      <GlassCard className="p-8 text-center text-gray-500">
        <p>สถิติและข้อมูลภาพรวมจะแสดงที่นี่ใน Phase ถัดไป</p>
      </GlassCard>
    </div>
  );
}
