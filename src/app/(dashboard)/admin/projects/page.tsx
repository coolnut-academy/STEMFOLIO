"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { listProjects } from '@/lib/firestore/projects';
import { Project } from '@/types';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus, Folder } from 'lucide-react';
import { getCategories } from '@/lib/firestore/settings';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [filterStatus, setFilterStatus] = useState<string>('active');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterYear, setFilterYear] = useState<string>('');

  const fetchFilters = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProjects({
        status: filterStatus ? (filterStatus as any) : undefined,
        category: filterCategory ? filterCategory : undefined,
        academicYear: filterYear ? filterYear : undefined,
      });
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory, filterYear]);

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการโครงงาน</h1>
          <p className="text-sm text-gray-500">รายชื่อโครงงานทั้งหมดในระบบ</p>
        </div>
        <Link href="/admin/projects/new">
          <Button className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> สร้างโครงงานใหม่
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select 
          options={[
            { label: 'กำลังดำเนินการ', value: 'active' },
            { label: 'จัดเก็บแล้ว', value: 'archived' },
            { label: 'ทั้งหมด', value: '' }
          ]}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        />
        <Select 
          options={[
            { label: 'ทุกหมวดหมู่', value: '' },
            ...categories.map(c => ({ label: c, value: c }))
          ]}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        />
        <Select 
          options={[
            { label: 'ทุกปีการศึกษา', value: '' },
            { label: '2569', value: '2569' },
            { label: '2568', value: '2568' },
            { label: '2567', value: '2567' }
          ]}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Spinner className="w-8 h-8 text-[var(--accent-blue)]" />
        </div>
      ) : projects.length === 0 ? (
        <EmptyState 
          icon={<Folder className="w-12 h-12" />}
          title="ไม่พบโครงงาน"
          description="ไม่พบโครงงานที่ตรงกับเงื่อนไข หรือยังไม่มีโครงงานในระบบ"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
