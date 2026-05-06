"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Image as ImageIcon, Link2, Film, MessageSquare } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { LinkAttachment } from './LinkAttachment';
import { useImageUpload } from '@/hooks/useImageUpload';
import { createEvent } from '@/lib/firestore/timeline';
import { Attachment } from '@/types';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';

interface PostComposerProps {
  projectId: string;
  onSuccess: () => void;
}

export const PostComposer = ({ projectId, onSuccess }: PostComposerProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'image' | 'link' | 'video' | null>(null);
  
  const [links, setLinks] = useState<Attachment[]>([]);
  const [videos, setVideos] = useState<Attachment[]>([]);
  
  const imageUpload = useImageUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create a temporary event ID for image upload path
      // but wait, we need eventId before uploading images.
      // Let's create the event first with empty attachments, then upload, then update.
      // Wait, if it fails, we have an empty event.
      // Alternatively, we upload first with a random UUID, then create event with that UUID.
      const eventId = crypto.randomUUID();
      
      let uploadedImages: Attachment[] = [];
      if (imageUpload.files.length > 0) {
        uploadedImages = await imageUpload.uploadAll(projectId, eventId);
        
        if (imageUpload.failedIndexes && imageUpload.failedIndexes.length > 0) {
          const proceed = window.confirm(`อัปโหลดรูปภาพไม่สำเร็จ ${imageUpload.failedIndexes.length} รูป คุณต้องการโพสต์ต่อโดยข้ามรูปที่ล้มเหลวหรือไม่?`);
          if (!proceed) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      await createEvent(projectId, {
        type: 'progress',
        title,
        description,
        isHighlight: false,
        attachments: [...uploadedImages, ...links, ...videos],
        createdBy: user.uid,
      });

      showToast('โพสต์ความคืบหน้าสำเร็จ', 'success');
      
      // Reset
      setTitle('');
      setDescription('');
      setLinks([]);
      setVideos([]);
      imageUpload.reset();
      setExpanded(false);
      setActiveTab(null);
      
      onSuccess();
    } catch (error) {
      console.error('Error posting:', error);
      showToast('เกิดข้อผิดพลาดในการโพสต์', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasAttachments = imageUpload.files.length > 0 || links.length > 0 || videos.length > 0;

  if (!expanded) {
    return (
      <GlassCard 
        className="p-4 cursor-text hover:border-[var(--accent-blue)] transition-colors flex items-center gap-3"
        onClick={() => setExpanded(true)}
      >
        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
          <MessageSquare className="w-5 h-5" />
        </div>
        <p className="text-gray-500 font-medium flex-1">เขียนความคืบหน้า หรืออัปเดตผลงาน...</p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 md:p-6 flex flex-col gap-4">
      <Input 
        placeholder="หัวข้อการอัปเดต *" 
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
        disabled={isSubmitting}
      />
      
      <TextArea 
        placeholder="รายละเอียด (ไม่บังคับ)" 
        value={description}
        onChange={e => setDescription(e.target.value)}
        disabled={isSubmitting}
        rows={3}
      />

      {activeTab === 'image' && (
        <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-700 text-sm">อัปโหลดรูปภาพ</h4>
            <button onClick={() => setActiveTab(null)} className="text-xs text-gray-500 hover:text-gray-700">ปิด</button>
          </div>
          <ImageUploader 
            files={imageUpload.files}
            previews={imageUpload.previews}
            uploading={imageUpload.uploading || isSubmitting}
            progress={imageUpload.progress}
            failedIndexes={imageUpload.failedIndexes}
            onAddFiles={imageUpload.addFiles}
            onRemoveFile={imageUpload.removeFile}
          />
        </div>
      )}

      {activeTab === 'link' && (
        <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-700 text-sm">แนบลิงก์</h4>
            <button onClick={() => setActiveTab(null)} className="text-xs text-gray-500 hover:text-gray-700">ปิด</button>
          </div>
          <LinkAttachment 
            type="link"
            links={links}
            onAddLink={link => setLinks([...links, link])}
            onRemoveLink={idx => setLinks(links.filter((_, i) => i !== idx))}
          />
        </div>
      )}

      {activeTab === 'video' && (
        <div className="p-4 bg-gray-50/50 rounded-lg border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-medium text-gray-700 text-sm">แนบวิดีโอ</h4>
            <button onClick={() => setActiveTab(null)} className="text-xs text-gray-500 hover:text-gray-700">ปิด</button>
          </div>
          <LinkAttachment 
            type="video"
            links={videos}
            onAddLink={link => setVideos([...videos, link])}
            onRemoveLink={idx => setVideos(videos.filter((_, i) => i !== idx))}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[var(--glass-border)]">
        <div className="flex gap-2">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className={`gap-1.5 ${activeTab === 'image' || imageUpload.files.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
            onClick={() => setActiveTab(activeTab === 'image' ? null : 'image')}
            disabled={isSubmitting}
          >
            <ImageIcon className="w-4 h-4" /> 
            <span className="hidden sm:inline">รูปภาพ</span>
            {imageUpload.files.length > 0 && `(${imageUpload.files.length})`}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className={`gap-1.5 ${activeTab === 'link' || links.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
            onClick={() => setActiveTab(activeTab === 'link' ? null : 'link')}
            disabled={isSubmitting}
          >
            <Link2 className="w-4 h-4" /> 
            <span className="hidden sm:inline">ลิงก์</span>
            {links.length > 0 && `(${links.length})`}
          </Button>
          
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className={`gap-1.5 ${activeTab === 'video' || videos.length > 0 ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
            onClick={() => setActiveTab(activeTab === 'video' ? null : 'video')}
            disabled={isSubmitting}
          >
            <Film className="w-4 h-4" /> 
            <span className="hidden sm:inline">วิดีโอ</span>
            {videos.length > 0 && `(${videos.length})`}
          </Button>
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => {
              if (title || description || hasAttachments) {
                if (window.confirm('คุณต้องการยกเลิกการเขียนโพสต์ใช่หรือไม่?')) {
                  setExpanded(false);
                  setTitle('');
                  setDescription('');
                  imageUpload.reset();
                  setLinks([]);
                  setVideos([]);
                }
              } else {
                setExpanded(false);
              }
            }}
            disabled={isSubmitting}
          >
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim() || isSubmitting} loading={isSubmitting}>
            โพสต์
          </Button>
        </div>
      </div>
    </GlassCard>
  );
};
