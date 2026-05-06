"use client";

import React from 'react';
import { ProjectForm } from '@/components/features/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">สร้างโครงงานใหม่</h1>
        <p className="text-sm text-gray-500">กรอกข้อมูลพื้นฐานเพื่อสร้างโครงงาน</p>
      </div>

      <ProjectForm />
    </div>
  );
}
