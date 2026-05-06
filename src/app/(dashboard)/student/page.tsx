"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FolderHeart, Sparkles, Key } from 'lucide-react';
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

      // Add to project
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        projectIds: arrayUnion(projectData.id)
      });

      await updateDoc(projectRef, {
        studentIds: arrayUnion(user.uid)
      });

      await updateDoc(doc(db, 'inviteCodes', inviteDoc.id), {
        usedCount: inviteData.usedCount + 1,
        usedBy: arrayUnion(user.uid)
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
    <div className="flex flex-col gap-8 pb-12 page-transition">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            สวัสดี, {userDoc?.name || 'นักเรียน'} <Sparkles className="text-yellow-500 w-6 h-6" />
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">จัดการและติดตามความคืบหน้าโครงงานของคุณ</p>
        </div>

        <GlassCard className="p-4 w-full md:w-auto min-w-[300px]">
          <form onSubmit={handleJoinProject} className="flex gap-2">
            <Input 
              placeholder="กรอก Invite Code" 
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono text-center tracking-widest bg-white/50 dark:bg-black/50 border-gray-200 dark:border-white/10"
              disabled={isJoining}
            />
            <Button type="submit" loading={isJoining} disabled={!inviteCode || isJoining} className="shrink-0 gap-2">
              <Key className="w-4 h-4" /> เข้าร่วม
            </Button>
          </form>
        </GlassCard>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({length: 4}).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState 
          icon={<FolderHeart className="w-16 h-16 text-blue-500" />}
          title="ยังไม่มีโครงงาน"
          description="กรอก Invite Code จากครูที่ปรึกษาที่ช่องด้านบนเพื่อเริ่มต้นทำโครงงาน"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
