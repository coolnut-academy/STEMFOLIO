"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { FolderHeart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { listProjectsByStudent } from '@/lib/firestore/projects';
import { Project } from '@/types';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Spinner } from '@/components/ui/Spinner';

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">สวัสดี, {userDoc?.name || 'นักเรียน'}</h1>
          <p className="text-gray-500">โครงงานของคุณทั้งหมด</p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner className="w-8 h-8 text-[var(--accent-blue)]" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState 
          icon={<FolderHeart className="w-12 h-12" />}
          title="ยังไม่มีโครงงาน"
          description="ใส่ Invite Code ที่ได้รับจากครูที่ปรึกษาเพื่อเข้าร่วมโครงงาน"
          action={
            <Link href="/join">
              <Button>ใช้ Invite Code</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
