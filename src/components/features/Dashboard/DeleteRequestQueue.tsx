"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { TimelineEvent, Project } from '@/types';
import { AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { approveDelete, rejectDelete } from '@/lib/firestore/timeline';
import { useToast } from '@/components/ui/Toast';

interface DeleteRequestQueueProps {
  requests: { event: TimelineEvent, project: Project }[];
  onRefresh: () => void;
}

export const DeleteRequestQueue = ({ requests, onRefresh }: DeleteRequestQueueProps) => {
  const { showToast } = useToast();
  
  const [selectedRequest, setSelectedRequest] = useState<{event: TimelineEvent, project: Project} | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return;
    
    setLoading(true);
    try {
      if (actionType === 'approve') {
        await approveDelete(selectedRequest.project.id, selectedRequest.event.id);
        showToast('ลบโพสต์เรียบร้อยแล้ว', 'success');
      } else {
        await rejectDelete(selectedRequest.project.id, selectedRequest.event.id);
        showToast('ปฏิเสธคำขอลบเรียบร้อยแล้ว', 'success');
      }
      onRefresh();
    } catch (error) {
      showToast('เกิดข้อผิดพลาด กรุณาลองใหม่', 'error');
    } finally {
      setLoading(false);
      setSelectedRequest(null);
      setActionType(null);
    }
  };

  if (requests.length === 0) return null;

  return (
    <>
      <GlassCard className="p-6 border-orange-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" /> คำขอลบโพสต์ ({requests.length})
        </h3>
        
        <div className="flex flex-col gap-3">
          {requests.map((req, idx) => (
            <div key={`${req.project.id}-${req.event.id}-${idx}`} className="bg-orange-50 rounded-lg p-4 border border-orange-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-bold text-gray-900 line-clamp-1">{req.event.title}</span>
                  <span className="text-xs text-gray-500 bg-white px-2 py-0.5 rounded-full border border-gray-200">
                    {req.project.title}
                  </span>
                </div>
                {req.event.deleteRequestReason && (
                  <div className="text-sm text-gray-700 italic">" {req.event.deleteRequestReason} "</div>
                )}
                <div className="text-xs text-gray-500 mt-2">
                  ขอลบเมื่อ {req.event.deleteRequestedAt ? formatDistanceToNow(req.event.deleteRequestedAt.toDate(), { addSuffix: true, locale: th }) : ''} 
                  โดย ID: {req.event.deleteRequestedBy}
                </div>
              </div>
              
              <div className="flex gap-2 shrink-0">
                <Button 
                  size="sm" 
                  variant="secondary"
                  className="text-gray-600 hover:text-gray-800"
                  onClick={() => {
                    setSelectedRequest(req);
                    setActionType('reject');
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> ปฏิเสธ
                </Button>
                <Button 
                  size="sm" 
                  variant="danger"
                  onClick={() => {
                    setSelectedRequest(req);
                    setActionType('approve');
                  }}
                >
                  <Check className="w-4 h-4 mr-1" /> อนุมัติลบ
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <ConfirmDialog
        isOpen={!!selectedRequest}
        title={actionType === 'approve' ? 'ยืนยันการอนุมัติลบโพสต์' : 'ยืนยันการปฏิเสธคำขอลบ'}
        message={
          actionType === 'approve' 
            ? `คุณแน่ใจหรือไม่ที่จะลบโพสต์ "${selectedRequest?.event.title}" ? ข้อมูลและรูปภาพจะถูกลบถาวร`
            : `คุณแน่ใจหรือไม่ที่จะปฏิเสธคำขอลบโพสต์ "${selectedRequest?.event.title}" ?`
        }
        isDanger={actionType === 'approve'}
        confirmText={actionType === 'approve' ? 'ลบถาวร' : 'ปฏิเสธคำขอ'}
        onConfirm={handleAction}
        onCancel={() => {
          setSelectedRequest(null);
          setActionType(null);
        }}
        isLoading={loading}
      />
    </>
  );
};
