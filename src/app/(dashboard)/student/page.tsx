"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/ui/EmptyState';
import { FolderHeart, Key } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { listProjectsByStudent } from '@/lib/firestore/projects';
import { Project, InviteCode } from '@/types';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function StudentDashboardPage() {
  const { user, userDoc } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const { showToast } = useToast();
  const router = useRouter();

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await listProjectsByStudent(user.uid);
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode || !user) return;

    setIsJoining(true);
    try {
      const q = query(collection(db, 'inviteCodes'), where('code', '==', inviteCode.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        showToast('ไม่พบรหัส Invite Code นี้', 'error');
        setIsJoining(false);
        return;
      }

      const inviteDoc = querySnapshot.docs[0];
      const inviteData = inviteDoc.data() as InviteCode;

      if (inviteData.usedCount >= inviteData.maxUses) {
        showToast('Invite Code นี้ถูกใช้งานครบจำนวนแล้ว', 'error');
        setIsJoining(false);
        return;
      }

      const projectRef = doc(db, 'projects', inviteData.projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        showToast('ไม่พบข้อมูลโครงงาน', 'error');
        setIsJoining(false);
        return;
      }

      const projectData = projectSnap.data() as Project;

      if (userDoc?.projectIds.includes(projectData.id)) {
        showToast('คุณอยู่ในโครงงานนี้อยู่แล้ว', 'info');
        setInviteCode('');
        setIsJoining(false);
        return;
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { projectIds: arrayUnion(projectData.id) });
      await updateDoc(projectRef, { studentIds: arrayUnion(user.uid) });
      await updateDoc(doc(db, 'inviteCodes', inviteDoc.id), {
        usedCount: inviteData.usedCount + 1,
        usedBy: arrayUnion(user.uid),
      });

      showToast(`เข้าร่วมโครงงาน ${projectData.title} สำเร็จ!`, 'success');
      setInviteCode('');
      fetchProjects();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการเข้าร่วมโครงงาน', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex flex-col gap-7 pb-12 page-transition">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold text-white">
            สวัสดี, {userDoc?.name || 'นักเรียน'}
          </h1>
          <p className="text-white/65 mt-1 text-sm">จัดการและติดตามความคืบหน้าโครงงานของคุณ</p>
        </div>

        {/* Invite code card */}
        <div className="w-full md:w-auto min-w-[280px]
          bg-[var(--glass-bg)] backdrop-blur-[24px]
          border border-[var(--glass-border)]
          rounded-[var(--radius-card)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60 mb-2.5">
            เข้าร่วมโครงงาน
          </p>
          <form onSubmit={handleJoinProject} className="flex gap-2">
            <Input
              placeholder="กรอก Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono text-center tracking-widest"
              disabled={isJoining}
            />
            <Button type="submit" loading={isJoining} disabled={!inviteCode || isJoining} className="shrink-0 gap-2">
              <Key className="w-4 h-4" /> เข้าร่วม
            </Button>
          </form>
        </div>
      </div>

      {/* Projects grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({length: 4}).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-[var(--radius-card)]" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderHeart className="w-10 h-10" />}
          title="ยังไม่มีโครงงาน"
          description="กรอก Invite Code จากครูที่ปรึกษาเพื่อเริ่มต้นทำโครงงาน"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              href={`/project/${project.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
