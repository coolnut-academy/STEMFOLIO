"use client";

import React, { useState } from 'react';
import { TimelineEvent } from '@/types';
import { GlassCard } from '@/components/ui/GlassCard';
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
  // Passing these so we don't need to put the modals inside each card
  onEdit?: (event: TimelineEvent) => void;
}

export const TimelineCard = ({ projectId, event, onRefresh, onEdit }: TimelineCardProps) => {
  const { user, role } = useAuth();
  const { showToast } = useToast();
  
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isRequestDeleteOpen, setIsRequestDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  const isAdmin = role === 'admin';
  const isOwner = user?.uid === event.createdBy;

  const getCardStyle = () => {
    switch (event.type) {
      case 'progress': return 'border-l-[4px] border-l-[var(--accent-blue)]';
      case 'submission': return 'border-l-[4px] border-l-[var(--accent-purple)]';
      case 'result': 
        if (event.result === 'pass' || event.result === 'award') return 'border-l-[4px] border-l-[var(--accent-green)]';
        if (event.result === 'fail') return 'border-l-[4px] border-l-red-500';
        return 'border-l-[4px] border-l-yellow-500';
      default: return '';
    }
  };

  const handleDelete = async () => {
    try {
      await approveDelete(projectId, event.id);
      showToast('ลบโพสต์สำเร็จ', 'success');
      onRefresh();
    } catch (error) {
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
    } catch (error) {
      showToast('เกิดข้อผิดพลาดในการส่งคำขอ', 'error');
    }
  };

  const images = event.attachments?.filter(a => a.type === 'image') || [];
  const links = event.attachments?.filter(a => a.type === 'link') || [];
  const videos = event.attachments?.filter(a => a.type === 'video') || [];

  return (
    <GlassCard className={`p-4 md:p-5 flex flex-col gap-3 ${getCardStyle()} relative overflow-hidden`}>
      {/* Delete Request Badge */}
      {event.deleteRequested && (
        <div className="absolute top-0 right-0 bg-orange-100 text-orange-600 px-3 py-1 rounded-bl-lg text-xs font-bold flex items-center gap-1 shadow-sm">
          <AlertCircle className="w-3 h-3" /> รอลบ
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant={event.type === 'progress' ? 'blue' : event.type === 'submission' ? 'purple' : 'green'}
          >
            {event.type === 'progress' ? 'ความคืบหน้า' : event.type === 'submission' ? 'การส่งแข่ง' : 'ผลลัพธ์'}
          </Badge>
          
          <span className="text-xs text-gray-500">
            {event.createdAt ? formatDistanceToNow(event.createdAt.toDate(), { addSuffix: true, locale: th }) : 'กำลังโหลด...'}
          </span>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1">
          {event.isHighlight && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
          
          {(isAdmin || (isOwner && event.type === 'progress')) && onEdit && (
            <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-blue-500" onClick={() => onEdit(event)}>
              <Edit2 className="w-4 h-4" />
            </Button>
          )}

          {isAdmin && (
            <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-red-500" onClick={() => setIsConfirmDeleteOpen(true)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {!isAdmin && isOwner && event.type === 'progress' && !event.deleteRequested && (
            <Button variant="ghost" size="sm" className="p-1 h-auto text-gray-400 hover:text-orange-500" onClick={() => setIsRequestDeleteOpen(true)}>
              <AlertTriangle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div>
        <h3 className="font-bold text-gray-900 text-lg">{event.title}</h3>
        {event.description && (
          <p className="text-gray-600 text-sm mt-1 whitespace-pre-wrap">{event.description}</p>
        )}
      </div>

      {/* Submission Specific */}
      {event.type === 'submission' && (
        <div className="mt-2 p-3 bg-purple-50/50 rounded-lg border border-purple-100 text-sm">
          <div className="flex flex-col gap-1">
            <span className="font-medium text-purple-900">เวที: {event.competitionName}</span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="gray" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Deadline: {event.deadline ? new Date(event.deadline.toDate()).toLocaleDateString('th-TH') : 'ยังไม่กำหนด'}
              </Badge>
              <Badge variant={event.submissionStatus === 'submitted' ? 'green' : 'yellow'}>
                {event.submissionStatus === 'submitted' ? 'ส่งแล้ว' : 'เตรียมตัว'}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Result Specific */}
      {event.type === 'result' && (
        <div className={`mt-2 p-3 rounded-lg border text-sm ${
          event.result === 'pass' || event.result === 'award' ? 'bg-green-50/50 border-green-100 text-green-900' :
          event.result === 'fail' ? 'bg-red-50/50 border-red-100 text-red-900' :
          'bg-yellow-50/50 border-yellow-100 text-yellow-900'
        }`}>
          <div className="font-medium">
            เวที: {event.competitionName || 'ไม่ระบุเวที'}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={
              event.result === 'pass' ? 'green' :
              event.result === 'award' ? 'blue' :
              event.result === 'fail' ? 'red' : 'yellow'
            }>
              {event.result === 'pass' ? 'ผ่านการคัดเลือก' :
               event.result === 'award' ? 'ได้รับรางวัล' :
               event.result === 'fail' ? 'ไม่ผ่าน' : 'รอดำเนินการ'}
            </Badge>
            {event.announcementUrl && (
              <a href={event.announcementUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                <Link2 className="w-3 h-3" /> ลิงก์ประกาศผล
              </a>
            )}
          </div>
        </div>
      )}

      {/* Attachments */}
      {(images.length > 0 || links.length > 0 || videos.length > 0) && (
        <div className="mt-2 flex flex-col gap-3 border-t border-gray-100 pt-3">
          
          {/* Images Grid */}
          {images.length > 0 && (
            <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1 md:w-1/2' : images.length === 2 ? 'grid-cols-2 md:w-2/3' : 'grid-cols-2 sm:grid-cols-3'}`}>
              {images.map((img, idx) => (
                <div 
                  key={img.id} 
                  className="aspect-video relative rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-gray-200"
                  onClick={() => setLightboxIndex(idx)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Links and Videos */}
          {(links.length > 0 || videos.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {videos.map(v => (
                <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-md text-sm hover:bg-red-100 transition-colors">
                  <Film className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{v.name}</span>
                </a>
              ))}
              {links.map(l => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-sm hover:bg-blue-100 transition-colors">
                  <Link2 className="w-4 h-4" />
                  <span className="truncate max-w-[200px]">{l.name}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {/* For Phase 3, we don't have the user name fetched alongside the event automatically unless we join it. 
          We just show the ID or fetch it. For now, showing ID or just omit. 
          We'll omit it to keep it clean or show createdBy ID. */}

      <ConfirmDialog 
        isOpen={isConfirmDeleteOpen}
        title="ยืนยันการลบโพสต์"
        message="การลบโพสต์จะทำให้รูปภาพที่แนบถูกลบไปด้วย และไม่สามารถกู้คืนได้ ยืนยันการลบ?"
        isDanger={true}
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmDeleteOpen(false)}
      />

      <ConfirmDialog 
        isOpen={isRequestDeleteOpen}
        title="ขอลบโพสต์"
        message="กรุณาระบุเหตุผลที่ต้องการลบ (เพื่อให้ครูพิจารณาอนุมัติ)"
        confirmText="ส่งคำขอ"
        onConfirm={handleRequestDelete}
        onCancel={() => setIsRequestDeleteOpen(false)}
      >
        <div className="mt-4">
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" 
            placeholder="เหตุผล (เช่น ใส่รูปผิด)" 
            value={deleteReason}
            onChange={e => setDeleteReason(e.target.value)}
            autoFocus
          />
        </div>
      </ConfirmDialog>

      {/* Lightbox */}
      <ImageLightbox 
        isOpen={images.length > 0 && lightboxIndex >= 0}
        images={images.map(img => img.url)}
        currentIndex={lightboxIndex >= 0 ? lightboxIndex : 0}
        onClose={() => setLightboxIndex(-1)}
        onNavigate={(index) => setLightboxIndex(index)}
      />
    </GlassCard>
  );
};
