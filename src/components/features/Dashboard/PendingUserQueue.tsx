"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { User } from '@/types';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserCheck, UserX, User as UserIcon } from 'lucide-react';

interface PendingUserQueueProps {
  users: User[];
  onRefresh: () => void;
}

export const PendingUserQueue = ({ users, onRefresh }: PendingUserQueueProps) => {
  const { showToast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (user: User) => {
    setProcessingId(user.id);
    try {
      await updateDoc(doc(db, 'users', user.id), { status: 'approved' });
      showToast(`อนุมัติผู้ใช้ ${user.name} เรียบร้อยแล้ว`, 'success');
      onRefresh();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (user: User) => {
    if (!confirm(`แน่ใจหรือไม่ว่าต้องการปฏิเสธผู้ใช้ ${user.name}?`)) return;
    setProcessingId(user.id);
    try {
      await updateDoc(doc(db, 'users', user.id), { status: 'rejected' });
      showToast(`ปฏิเสธผู้ใช้ ${user.name} แล้ว`, 'success');
      onRefresh();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (users.length === 0) return null;

  return (
    <GlassCard className="p-6 border-orange-200 dark:border-orange-900/50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
      <div className="flex items-center gap-2 mb-4 text-orange-600 dark:text-orange-400">
        <UserIcon className="w-5 h-5" />
        <h3 className="font-bold text-lg">รอยืนยันการสมัคร ({users.length})</h3>
      </div>

      <div className="flex flex-col gap-3">
        {users.map(user => (
          <div key={user.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{user.name}</p>
                {user.nickname && <span className="text-sm text-gray-500 dark:text-gray-400">({user.nickname})</span>}
                <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full">
                  ชั้น {user.classRoom} เลขที่ {user.studentId}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                อีเมลแข่งขัน: {user.competitionEmail} | โทร: {user.competitionPhone}
              </p>
            </div>
            
            <div className="flex gap-2 mt-3 md:mt-0">
              <Button 
                size="sm" 
                variant="danger" 
                onClick={() => handleReject(user)}
                disabled={!!processingId}
                loading={processingId === user.id}
                className="gap-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400"
              >
                <UserX className="w-4 h-4" /> ปฏิเสธ
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleApprove(user)}
                disabled={!!processingId}
                loading={processingId === user.id}
                className="gap-1 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
              >
                <UserCheck className="w-4 h-4" /> อนุมัติ
              </Button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};
