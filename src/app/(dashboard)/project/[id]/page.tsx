"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import { Spinner } from '@/components/ui/Spinner';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, loading } = useProject(projectId);
  const { role } = useAuth();

  if (loading) {
    return <div className="py-20 flex justify-center"><Spinner className="w-8 h-8 text-[var(--accent-blue)]" /></div>;
  }

  if (!project) {
    return <div className="py-20 text-center text-gray-500">ไม่พบข้อมูลโครงงาน</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          <p className="text-sm text-gray-500">{project.category} | {project.academicYear}</p>
        </div>
        {role === 'admin' && (
          <Button onClick={() => router.push(`/project/${projectId}/edit`)}>
            แก้ไขข้อมูล
          </Button>
        )}
      </div>

      <GlassCard className="p-8 text-center text-gray-500">
        <h2 className="text-xl font-bold mb-4">Timeline</h2>
        <p>ส่วนของ Timeline จะถูกพัฒนาใน Phase 3</p>
      </GlassCard>
    </div>
  );
}
