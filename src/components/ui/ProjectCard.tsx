import React from 'react';
import Link from 'next/link';
import { GlassCard } from './GlassCard';
import { Badge } from './Badge';
import { Users, LayoutList } from 'lucide-react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  href: string;
}

export const ProjectCard = ({ project, href }: ProjectCardProps) => {
  return (
    <Link href={href}>
      <GlassCard hoverEffect className="h-full flex flex-col overflow-hidden cursor-pointer">
        {project.coverImageUrl ? (
          <div className="h-32 w-full bg-gray-200 dark:bg-gray-800 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={project.coverImageUrl} alt={project.title} className="w-full h-full object-cover opacity-90 transition-opacity hover:opacity-100" />
            <div className="absolute top-2 right-2 flex gap-1">
              {project.status === 'active' && <Badge variant="green">ดำเนินการ</Badge>}
              {project.status === 'archived' && <Badge variant="gray">จัดเก็บแล้ว</Badge>}
              {!project.isPublic && <Badge variant="yellow">ส่วนตัว</Badge>}
            </div>
          </div>
        ) : (
          <div className="h-32 w-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center relative border-b border-[var(--glass-border)]">
            <span className="text-gray-400 dark:text-gray-500 font-medium">ไม่มีรูปปก</span>
            <div className="absolute top-2 right-2 flex gap-1">
              {project.status === 'active' && <Badge variant="green">ดำเนินการ</Badge>}
              {project.status === 'archived' && <Badge variant="gray">จัดเก็บแล้ว</Badge>}
              {!project.isPublic && <Badge variant="yellow">ส่วนตัว</Badge>}
            </div>
          </div>
        )}
        
        <div className="p-4 flex flex-col flex-1">
          <div className="mb-2">
            <Badge variant="blue" className="mb-2">{project.category}</Badge>
            <h3 className="font-bold text-gray-900 dark:text-gray-100 line-clamp-2">{project.title}</h3>
            {project.titleEn && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">{project.titleEn}</p>}
          </div>
          
          <div className="mt-auto pt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 border-t border-[var(--glass-border)]">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span>{project.studentIds?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LayoutList className="w-4 h-4" />
              <span>{project.timelineEventCount || 0} โพสต์</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
};
