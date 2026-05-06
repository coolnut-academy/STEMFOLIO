"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import { Spinner } from '@/components/ui/Spinner';
import { ProjectForm } from '@/components/features/ProjectForm';
import { useAuth } from '@/hooks/useAuth';

export default function EditProjectPage() {
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

  if (role !== 'admin') {
    return <div className="py-20 text-center text-red-500">ไม่มีสิทธิ์เข้าถึงหน้านี้</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">แก้ไขโครงงาน: {project.title}</h1>
        <p className="text-sm text-gray-500">แก้ไขข้อมูลหรือจัดเก็บโครงงาน</p>
      </div>

      <ProjectForm initialData={project} />
    </div>
  );
}
