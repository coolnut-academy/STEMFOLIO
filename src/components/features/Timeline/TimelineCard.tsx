"use client";

import React, { useState } from 'react';
import { TimelineEvent } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { Star, Link2, Film, Clock, Edit2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { requestDelete, approveDelete } from '@/lib/firestore/timeline';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ImageLightbox } from '@/components/ui/ImageLightbox';

interface TimelineCardProps {
  projectId: string;
  event: TimelineEvent;
  onRefresh: () => void;
  onEdit?: (event: TimelineEvent) => void;
}

export const TimelineCard = ({ projectId, event, onRefresh, onEdit }: TimelineCardProps) => {
  const { user, role } = useAuth();
  const { showToast } = useToast();

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isRequestDeleteOpen, setIsRequestDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const isAdmin = role === 'admin';
  const isOwner = user?.uid === event.createdBy;

  const accentMap = {
    progress:   { border: 'border-l-blue-400',   glow: 'shadow-[-3px_0_12px_rgba(0,102,255,0.10)]',  badge: 'blue'   as const },
    submission: { border: 'border-l-violet-400',  glow: 'shadow-[-3px_0_12px_rgba(139,92,246,0.10)]', badge: 'purple' as const },
    result:     { border: 'border-l-emerald-400', glow: 'shadow-[-3px_0_12px_rgba(52,211,153,0.10)]', badge: 'green'  as const },
  };

  const getResultAccent = () => {
    if (event.type !== 'result') return accentMap.result;
    if (event.result === 'fail')    return { ...accentMap.result, border: 'border-l-rose-400',   glow: 'shadow-[-3px_0_12px_rgba(251,113,133,0.10)]' };
    if (event.result === 'pending') return { ...accentMap.result, border: 'border-l-amber-400',  glow: 'shadow-[-3px_0_12px_rgba(251,191,36,0.10)]' };
    return accentMap.result;
  };

  const accent = event.type === 'result' ? getResultAccent() : accentMap[event.type];

  const handleDelete = async () => {
    try {
      await approveDelete(projectId, event.id);
      showToast('ลบโพสต์สำเร็จ', 'success');
      onRefresh();
    } catch {
      showToast('เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  const handleRequestDelete = async () => {
    if (!user) return;
    try {
      await requestDelete(projectId, event.id, deleteReason, user.uid);
      showToast('ส่งคำขอลบสำเร็จ', 'success');
      setIsRequestDeleteOpen(false);
      onRefresh();
    } catch {
      showToast('เกิดข้อผิดพลาดในการส่งคำขอ', 'error');
    }
  };

  const images = event.attachments?.filter(a => a.type === 'image') || [];
  const links  = event.attachments?.filter(a => a.type === 'link')  || [];
  const videos = event.attachments?.filter(a => a.type === 'video') || [];

  const labelMap = {
    progress:   'ความคืบหน้า',
    submission: 'การส่งแข่ง',
    result:     'ผลลัพธ์',
  };

  return (
    <div className={`
      relative overflow-hidden
      bg-[var(--glass-bg)] backdrop-blur-[24px]
      border border-[rgba(255,255,255,0.08)] border-l-[3px] ${accent.border}
      rounded-[var(--radius-card)] ${accent.glow}
      transition-all duration-300
      hover:bg-[var(--glass-bg-hover)] hover:border-[rgba(99,102,241,0.20)] hover:border-l-[3px]
      hover:shadow-[0_8px_32px_rgba(0,0,0,0.40)]
      p-4 md:p-5 flex flex-col gap-3
    `}>
      {/* Pending delete badge */}
      {event.deleteRequested && (
        <div className="absolute top-0 right-0 bg-orange-50 dark:bg-[rgba(255,107,53,0.15)] border-l border-b border-orange-200 dark:border-[rgba(255,107,53,0.30)] text-orange-500 dark:text-orange-400 px-3 py-1 rounded-bl-xl text-[10px] font-mono font-bold flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> รอลบ
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-3 pt-0.5">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={accentMap[event.type]?.badge || 'gray'}>
            {labelMap[event.type]}
          </Badge>
          <span className="text-[11px] font-mono text-white/52">
            {event.createdAt
              ? formatDistanceToNow(event.createdAt.toDate(), { addSuffix: true, locale: th })
              : '...'}
          </span>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {event.isHighlight && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}

          {(isAdmin || (isOwner && event.type === 'progress')) && onEdit && (
            <Button variant="ghost" size="sm" className="p-1.5 h-auto !border-transparent" onClick={() => onEdit(event)}>
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
          )}

          {isAdmin && (
            <Button variant="ghost" size="sm" className="p-1.5 h-auto !border-transparent hover:!text-rose-500" onClick={() => setIsConfirmDeleteOpen(true)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}

          {!isAdmin && isOwner && event.type === 'progress' && !event.deleteRequested && (
            <Button variant="ghost" size="sm" className="p-1.5 h-auto !border-transparent hover:!text-orange-500" onClick={() => setIsRequestDeleteOpen(true)}>
              <AlertTriangle className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="font-bold text-white/90 text-base leading-snug">{event.title}</h3>
        {event.description && (
          <p className="text-white/65 text-sm mt-1.5 whitespace-pre-wrap leading-relaxed">{event.description}</p>
        )}
      </div>

      {/* Submission details */}
      {event.type === 'submission' && (
        <div className="mt-1 p-3 bg-[rgba(168,85,247,0.07)] rounded-xl border border-[rgba(168,85,247,0.20)] text-sm">
          <span className="font-semibold text-[#d8b4fe]">เวที: {event.competitionName}</span>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="gray" className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {event.deadline ? new Date(event.deadline.toDate()).toLocaleDateString('th-TH') : 'ยังไม่กำหนด'}
            </Badge>
            <Badge variant={event.submissionStatus === 'submitted' ? 'green' : 'yellow'}>
              {event.submissionStatus === 'submitted' ? 'ส่งแล้ว' : 'เตรียมตัว'}
            </Badge>
          </div>
        </div>
      )}

      {/* Result details */}
      {event.type === 'result' && (
        <div className={`mt-1 p-3 rounded-xl border text-sm ${
          event.result === 'pass' || event.result === 'award'
            ? 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.22)]'
            : event.result === 'fail'
            ? 'bg-[rgba(239,68,68,0.08)] border-[rgba(239,68,68,0.22)]'
            : 'bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.22)]'
        }`}>
          <span className="font-semibold text-white/80">เวที: {event.competitionName || 'ไม่ระบุ'}</span>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={
              event.result === 'pass'  ? 'green'  :
              event.result === 'award' ? 'blue'   :
              event.result === 'fail'  ? 'red'    : 'yellow'
            }>
              {event.result === 'pass'    ? 'ผ่านการคัดเลือก' :
               event.result === 'award'  ? 'ได้รับรางวัล'    :
               event.result === 'fail'   ? 'ไม่ผ่าน'         : 'รอดำเนินการ'}
            </Badge>
            {event.announcementUrl && (
              <a href={event.announcementUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-mono text-[#818cf8] hover:underline">
                <Link2 className="w-3 h-3" /> ลิงก์ประกาศ
              </a>
            )}
          </div>
        </div>
      )}

      {/* Attachments */}
      {(images.length > 0 || links.length > 0 || videos.length > 0) && (
        <div className="flex flex-col gap-3 border-t border-[rgba(255,255,255,0.07)] pt-3 mt-1">

          {images.length > 0 && (
            <div className={`grid gap-2 ${
              images.length === 1 ? 'grid-cols-1 max-w-sm' :
              images.length === 2 ? 'grid-cols-2'           : 'grid-cols-2 sm:grid-cols-3'
            }`}>
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="aspect-video rounded-xl overflow-hidden border border-[rgba(255,255,255,0.10)] hover:border-[rgba(99,102,241,0.40)] transition-all group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" />
                </button>
              ))}
            </div>
          )}

          {(links.length > 0 || videos.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {videos.map(v => (
                <a key={v.id} href={v.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(239,68,68,0.10)] text-[#fca5a5] border border-[rgba(239,68,68,0.25)] rounded-lg text-xs font-mono hover:bg-[rgba(239,68,68,0.16)] transition-colors">
                  <Film className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[180px]">{v.name}</span>
                </a>
              ))}
              {links.map(l => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(99,102,241,0.10)] text-[#c7d2fe] border border-[rgba(99,102,241,0.25)] rounded-lg text-xs font-mono hover:bg-[rgba(99,102,241,0.16)] transition-colors">
                  <Link2 className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[180px]">{l.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        title="ยืนยันการลบโพสต์"
        message="การลบโพสต์จะทำให้รูปภาพที่แนบถูกลบไปด้วย และไม่สามารถกู้คืนได้"
        isDanger
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      <ConfirmDialog
        isOpen={isRequestDeleteOpen}
        title="ขอลบโพสต์"
        message="กรุณาระบุเหตุผลที่ต้องการลบ"
        confirmText="ส่งคำขอ"
        onConfirm={handleRequestDelete}
        onCancel={() => setIsRequestDeleteOpen(false)}
      >
        <div className="mt-3">
          <input
            type="text"
            className="w-full px-3 py-2 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.10)] rounded-lg text-sm text-white/85 placeholder-white/35 focus:outline-none focus:border-[rgba(99,102,241,0.55)] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.15)] transition-all"
            placeholder="เหตุผล เช่น ใส่รูปผิด"
            value={deleteReason}
            onChange={e => setDeleteReason(e.target.value)}
            autoFocus
          />
        </div>
      </ConfirmDialog>

      <ImageLightbox
        isOpen={images.length > 0 && lightboxIndex >= 0}
        images={images.map(img => img.url)}
        currentIndex={lightboxIndex >= 0 ? lightboxIndex : 0}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};
