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
        bg-[var(--glass-bg)] backdrop-blur-[24px]
        border border-[var(--glass-border)]
        shadow-[var(--glass-shadow)]
        transition-all duration-300
        group-hover:bg-[var(--glass-bg-hover)]
        group-hover:border-[rgba(99,102,241,0.28)]
        group-hover:translate-x-0.5
        group-hover:shadow-[0_12px_48px_rgba(0,0,0,0.45)]
      ">
        {/* Top accent line on hover */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[rgba(99,102,241,0)] to-transparent group-hover:via-[rgba(99,102,241,0.55)] transition-all duration-500" />

        {/* Cover image */}
        {project.coverImageUrl ? (
          <div className="relative h-36 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.coverImageUrl}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(6,9,24,0.80)] via-transparent to-transparent" />
            <div className="absolute top-2.5 right-2.5 flex gap-1.5">
              {project.status === 'active'   && <Badge variant="green">ดำเนินการ</Badge>}
              {project.status === 'archived' && <Badge variant="gray">จัดเก็บแล้ว</Badge>}
              {!project.isPublic             && <Badge variant="yellow">ส่วนตัว</Badge>}
            </div>
          </div>
        ) : (
          <div className="relative h-36 bg-[rgba(99,102,241,0.06)] flex items-center justify-center border-b border-[rgba(255,255,255,0.05)]">
            <Layers className="w-10 h-10 text-[rgba(129,140,248,0.25)] group-hover:text-[rgba(129,140,248,0.40)] transition-colors" />
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
            <h3 className="font-semibold text-white/90 line-clamp-2 leading-snug text-sm group-hover:text-white transition-colors">
              {project.title}
            </h3>
            {project.titleEn && (
              <p className="text-[11px] text-white/50 line-clamp-1 mt-1">{project.titleEn}</p>
            )}
          </div>

          <div className="mt-auto pt-3 flex items-center gap-4 border-t border-[rgba(255,255,255,0.06)]">
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <Users className="w-3.5 h-3.5" />
              <span>{project.studentIds?.length || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/55">
              <LayoutList className="w-3.5 h-3.5" />
              <span>{project.timelineEventCount || 0} โพสต์</span>
            </div>
            <span className="ml-auto text-[10px] font-mono text-white/45">{project.academicYear}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
