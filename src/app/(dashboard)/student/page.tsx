"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/ui/EmptyState';
import { FolderHeart } from 'lucide-react';
import { listProjectsByStudent } from '@/lib/firestore/projects';
import { Project } from '@/types';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Skeleton } from '@/components/ui/Skeleton';

export default function StudentDashboardPage() {
  const { user, userDoc } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-7 pb-12 page-transition">
      <div>
        <h1 className="text-2xl font-bold text-white">
          สวัสดี, {userDoc?.name || 'นักเรียน'}
        </h1>
        <p className="text-white/65 mt-1 text-sm">จัดการและติดตามความคืบหน้าโครงงานของคุณ</p>
      </div>

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
          description="ติดต่อครูผู้สอนเพื่อเข้าร่วมโครงงาน"
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
