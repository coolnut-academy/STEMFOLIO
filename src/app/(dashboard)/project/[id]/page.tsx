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

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { project, loading: projectLoading } = useProject(projectId);
  const { events, loading: timelineLoading, refresh, filterByType, currentFilter } = useTimeline(projectId);
  const { role } = useAuth();

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
    return <div className="py-20 text-center text-gray-500">ไม่พบข้อมูลโครงงาน</div>;
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
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
            {project.titleEn && <p className="text-gray-500 text-sm mt-1">{project.titleEn}</p>}
            
            <div className="mt-4 flex gap-4 text-sm">
              <div>
                <span className="text-gray-500 block mb-1">นักเรียน</span>
                <div className="flex flex-col gap-1 font-medium">
                  {project.studentIds && project.studentIds.length > 0 
                    ? project.studentIds.map(id => <span key={id}>{id}</span>) 
                    : <span className="text-gray-400">ยังไม่มี</span>}
                </div>
              </div>
              <div>
                <span className="text-gray-500 block mb-1">ครูที่ปรึกษา</span>
                <div className="flex flex-col gap-1 font-medium">
                  {project.advisorIds && project.advisorIds.length > 0 
                    ? project.advisorIds.map(id => <span key={id}>{id}</span>) 
                    : <span className="text-gray-400">ยังไม่มี</span>}
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
          <div className="flex gap-2 bg-white/50 p-1 rounded-lg border border-gray-200">
            <button 
              className={`px-3 py-1 text-sm rounded-md transition-colors ${!currentFilter ? 'bg-white shadow-sm font-medium' : 'text-gray-500 hover:bg-white/50'}`}
              onClick={() => filterByType(undefined)}
            >
              ทั้งหมด
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md transition-colors ${currentFilter === 'progress' ? 'bg-white shadow-sm font-medium text-blue-600' : 'text-gray-500 hover:bg-white/50'}`}
              onClick={() => filterByType('progress')}
            >
              ความคืบหน้า
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md transition-colors ${currentFilter === 'submission' ? 'bg-white shadow-sm font-medium text-purple-600' : 'text-gray-500 hover:bg-white/50'}`}
              onClick={() => filterByType('submission')}
            >
              การส่งแข่ง
            </button>
            <button 
              className={`px-3 py-1 text-sm rounded-md transition-colors ${currentFilter === 'result' ? 'bg-white shadow-sm font-medium text-green-600' : 'text-gray-500 hover:bg-white/50'}`}
              onClick={() => filterByType('result')}
            >
              ผลลัพธ์
            </button>
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
