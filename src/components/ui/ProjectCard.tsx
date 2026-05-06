import React from 'react';
import Link from 'next/link';
import { Badge } from './Badge';
import { Users, LayoutList, Layers } from 'lucide-react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  href: string;
}

export const ProjectCard = ({ project, href }: ProjectCardProps) => {
  return (
    <Link href={href} className="group block h-full">
      <div className="
        relative h-full flex flex-col overflow-hidden rounded-[var(--radius-card)]
        bg-white/85 dark:bg-[rgba(8,12,30,0.80)]
        backdrop-blur-[40px]
        border border-slate-200/70 dark:border-white/8
        shadow-[0_4px_20px_rgba(0,66,180,0.07),0_1px_2px_rgba(0,0,0,0.04)]
        dark:shadow-[0_4px_20px_rgba(0,0,0,0.35)]
        transition-all duration-300
        group-hover:border-blue-200 dark:group-hover:border-[rgba(77,159,255,0.28)]
        group-hover:-translate-y-1.5
        group-hover:shadow-[0_8px_36px_rgba(0,66,180,0.14),0_2px_6px_rgba(0,0,0,0.06)]
        dark:group-hover:shadow-[0_8px_36px_rgba(0,0,0,0.45)]
      ">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/0 to-transparent group-hover:via-blue-400/60 transition-all duration-500" />

        {/* Cover image */}
        {project.coverImageUrl ? (
          <div className="relative h-36 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 dark:from-[rgba(8,12,30,0.85)] via-transparent to-transparent" />
            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
              {project.status === 'active'   && <Badge variant="green">ดำเนินการ</Badge>}
              {project.status === 'archived' && <Badge variant="gray">จัดเก็บแล้ว</Badge>}
              {!project.isPublic             && <Badge variant="yellow">ส่วนตัว</Badge>}
            </div>
          </div>
        ) : (
          <div className="relative h-36 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 flex items-center justify-center border-b border-slate-100 dark:border-white/5">
            <Layers className="w-10 h-10 text-blue-200 dark:text-blue-800 group-hover:text-blue-300 transition-colors" />
            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
              {project.status === 'active'   && <Badge variant="green">ดำเนินการ</Badge>}
              {project.status === 'archived' && <Badge variant="gray">จัดเก็บแล้ว</Badge>}
              {!project.isPublic             && <Badge variant="yellow">ส่วนตัว</Badge>}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex flex-col flex-1 p-4 gap-3">
          <div>
            <Badge variant="blue" className="mb-2">{project.category}</Badge>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
              {project.title}
            </h3>
            {project.titleEn && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-1">{project.titleEn}</p>
            )}
          </div>

          <div className="mt-auto pt-3 flex items-center gap-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Users className="w-3.5 h-3.5" />
              <span>{project.studentIds?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <LayoutList className="w-3.5 h-3.5" />
              <span>{project.timelineEventCount || 0} โพสต์</span>
            </div>
            <span className="ml-auto text-[10px] font-mono text-slate-300 dark:text-slate-600">{project.academicYear}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
