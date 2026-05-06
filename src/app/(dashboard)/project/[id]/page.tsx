"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProject } from '@/hooks/useProject';
import { useTimeline } from '@/hooks/useTimeline';
import { Skeleton } from '@/components/ui/Skeleton';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { PostComposer } from '@/components/features/Timeline/PostComposer';
import { TimelineCard } from '@/components/features/Timeline/TimelineCard';
import { SubmissionForm } from '@/components/features/Timeline/SubmissionForm';
import { ResultForm } from '@/components/features/Timeline/ResultForm';
import { EditEventModal } from '@/components/features/Timeline/EditEventModal';
import { TimelineEvent } from '@/types';
import { Plus, MessageSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStudents } from '@/hooks/useStudents';
import { useAdvisors } from '@/hooks/useAdvisors';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, loading: projectLoading } = useProject(projectId);
  const { events, loading: timelineLoading, refresh, filterByType, currentFilter } = useTimeline(projectId);
  const { role } = useAuth();
  const { students } = useStudents();
  const { advisors } = useAdvisors();

  const [isSubmissionFormOpen, setIsSubmissionFormOpen] = useState(false);
  const [isResultFormOpen, setIsResultFormOpen] = useState(false);
  
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);

  const isAdmin = role === 'admin';

  if (projectLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
        <GlassCard className="p-6 flex flex-col gap-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex gap-4 mt-4">
            <Skeleton className="h-16 w-1/2" />
            <Skeleton className="h-16 w-1/2" />
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!project) {
    return <div className="py-20 text-center text-white/50">ไม่พบข้อมูลโครงงาน</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue">{project.category}</Badge>
              <Badge variant="gray">ปี {project.academicYear}</Badge>
              {project.status === 'archived' && <Badge variant="yellow">จัดเก็บแล้ว</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-white/92">{project.title}</h1>
            {project.titleEn && <p className="text-white/50 text-sm mt-1">{project.titleEn}</p>}

            <div className="mt-4 flex flex-wrap gap-6 text-sm">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/45 block mb-1.5">นักเรียน</span>
                <div className="flex flex-col gap-1">
                  {project.studentIds?.length > 0
                    ? project.studentIds.map(id => {
                        const s = students.find(s => s.id === id);
                        return (
                          <span key={id} className="text-white/75 text-xs">
                            {s ? `${s.name}${s.nickname ? ` (${s.nickname})` : ''}` : id}
                          </span>
                        );
                      })
                    : <span className="text-white/38 text-xs italic">ยังไม่มี</span>}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-white/45 block mb-1.5">ครูที่ปรึกษา</span>
                <div className="flex flex-col gap-1">
                  {project.advisorIds?.length > 0
                    ? project.advisorIds.map(id => {
                        const a = advisors.find(a => a.id === id);
                        return (
                          <span key={id} className="text-white/75 text-xs">
                            {a ? `${a.title || ''}${a.name}` : id}
                          </span>
                        );
                      })
                    : <span className="text-white/38 text-xs italic">ยังไม่มี</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="secondary" onClick={() => router.push(`/project/${projectId}/edit`)}>
                แก้ไขโครงงาน
              </Button>
            )}
            {/* Preview Portfolio would be implemented later */}
          </div>
        </div>
      </GlassCard>

      {/* Timeline Layout */}
      <div className="flex flex-col gap-6 relative">
        
        {/* Post Composer Sticky */}
        <div className="sticky top-20 z-10">
          <PostComposer projectId={projectId} onSuccess={refresh} />
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap gap-1 bg-[rgba(255,255,255,0.03)] p-1 rounded-xl border border-[rgba(255,255,255,0.07)]">
            {([
              { key: undefined,      label: 'ทั้งหมด',     activeColor: 'text-white/88' },
              { key: 'progress',     label: 'ความคืบหน้า', activeColor: 'text-[#c7d2fe]' },
              { key: 'submission',   label: 'การส่งแข่ง',  activeColor: 'text-[#c4b5fd]' },
              { key: 'result',       label: 'ผลลัพธ์',     activeColor: 'text-[#6ee7b7]' },
            ] as const).map(({ key, label, activeColor }) => (
              <button
                key={String(key)}
                type="button"
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  currentFilter === key
                    ? `bg-[rgba(99,102,241,0.14)] border border-[rgba(99,102,241,0.28)] ${activeColor} font-semibold`
                    : 'text-white/45 hover:text-white/72 border border-transparent hover:bg-[rgba(255,255,255,0.04)]'
                }`}
                onClick={() => filterByType(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => setIsSubmissionFormOpen(true)} className="gap-1 px-2">
                <Plus className="w-4 h-4" /> แข่งขัน
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setIsResultFormOpen(true)} className="gap-1 px-2">
                <Plus className="w-4 h-4" /> ผลลัพธ์
              </Button>
            </div>
          )}
        </div>

        {/* Timeline Feed */}
        <div className="flex flex-col gap-4 pb-20">
          {timelineLoading && events.length === 0 ? (
            <div className="flex flex-col gap-4">
              {Array.from({length: 3}).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <EmptyState 
              icon={<MessageSquare className="w-12 h-12" />}
              title="ยังไม่มีความคืบหน้า"
              description="เริ่มโพสต์ความคืบหน้าแรกของโครงงานนี้"
            />
          ) : (
            events.map(event => (
              <TimelineCard 
                key={event.id} 
                projectId={projectId} 
                event={event} 
                onRefresh={refresh}
                onEdit={setEditingEvent}
              />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      <SubmissionForm 
        projectId={projectId} 
        isOpen={isSubmissionFormOpen} 
        onClose={() => setIsSubmissionFormOpen(false)} 
        onSuccess={refresh} 
      />
      <ResultForm 
        projectId={projectId} 
        isOpen={isResultFormOpen} 
        onClose={() => setIsResultFormOpen(false)} 
        onSuccess={refresh} 
      />
      <EditEventModal 
        projectId={projectId} 
        event={editingEvent} 
        isOpen={!!editingEvent} 
        onClose={() => setEditingEvent(null)} 
        onSuccess={refresh} 
      />
    </div>
  );
}
