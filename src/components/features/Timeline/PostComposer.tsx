"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Image as ImageIcon, Link2, Film, Zap } from 'lucide-react';
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

type Tab = 'image' | 'link' | 'video' | null;

export const PostComposer = ({ projectId, onSuccess }: PostComposerProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>(null);
  const [links, setLinks] = useState<Attachment[]>([]);
  const [videos, setVideos] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageUpload = useImageUpload();

  const handleSubmit = async () => {
    if (!title.trim() || !user) return;
    setIsSubmitting(true);
    try {
      const eventId = crypto.randomUUID();
      let uploadedImages: Attachment[] = [];

      if (imageUpload.files.length > 0) {
        uploadedImages = await imageUpload.uploadAll(projectId, eventId);
        if (imageUpload.failedIndexes?.length > 0) {
          const ok = window.confirm(`อัปโหลดรูปไม่สำเร็จ ${imageUpload.failedIndexes.length} รูป ต้องการโพสต์ต่อไหม?`);
          if (!ok) { setIsSubmitting(false); return; }
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
      setTitle(''); setDescription(''); setLinks([]); setVideos([]);
      imageUpload.reset(); setExpanded(false); setActiveTab(null);
      onSuccess();
    } catch {
      showToast('เกิดข้อผิดพลาดในการโพสต์', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasContent = title || description || imageUpload.files.length > 0 || links.length > 0 || videos.length > 0;

  const tabBtn = (tab: Tab, Icon: React.ElementType, label: string, count: number) => (
    <button
      type="button"
      disabled={isSubmitting}
      onClick={() => setActiveTab(activeTab === tab ? null : tab)}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
        ${activeTab === tab || count > 0
          ? 'bg-[rgba(99,102,241,0.15)] border border-[rgba(99,102,241,0.35)] text-[#c7d2fe]'
          : 'border border-[rgba(255,255,255,0.08)] text-white/50 hover:text-white/80 hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.04)]'}
      `}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">{label}</span>
      {count > 0 && (
        <span className="bg-[#6366f1] text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-bold">
          {count}
        </span>
      )}
    </button>
  );

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="
          w-full flex items-center gap-3 px-5 py-3.5 text-left
          bg-[rgba(255,255,255,0.03)]
          backdrop-blur-[20px]
          border border-[rgba(255,255,255,0.07)]
          rounded-[var(--radius-card)]
          hover:border-[rgba(99,102,241,0.30)]
          hover:bg-[rgba(99,102,241,0.05)]
          transition-all duration-200 group
        "
      >
        <div className="w-8 h-8 rounded-lg bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.22)] flex items-center justify-center group-hover:shadow-[0_0_10px_rgba(99,102,241,0.20)] transition-shadow shrink-0">
          <Zap className="w-4 h-4 text-[#818cf8]" />
        </div>
        <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
          เขียนความคืบหน้า หรืออัปเดตผลงาน...
        </span>
      </button>
    );
  }

  return (
    <div className="
      relative
      bg-[rgba(8,12,30,0.85)]
      backdrop-blur-[20px]
      border border-[rgba(99,102,241,0.18)]
      rounded-[var(--radius-card)]
      shadow-[0_4px_24px_rgba(0,0,0,0.30)]
      p-4 md:p-5 flex flex-col gap-4
    ">
      <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[rgba(99,102,241,0.40)] to-transparent" />

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
        <div className="p-4 bg-[rgba(99,102,241,0.04)] rounded-xl border border-[rgba(99,102,241,0.12)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#818cf8]/70">อัปโหลดรูปภาพ</span>
            <button type="button" onClick={() => setActiveTab(null)} className="text-[10px] font-medium text-white/38 hover:text-white/65 transition-colors">ปิด ×</button>
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
        <div className="p-4 bg-[rgba(99,102,241,0.04)] rounded-xl border border-[rgba(99,102,241,0.12)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#818cf8]/70">แนบลิงก์</span>
            <button type="button" onClick={() => setActiveTab(null)} className="text-[10px] font-medium text-white/38 hover:text-white/65 transition-colors">ปิด ×</button>
          </div>
          <LinkAttachment type="link" links={links} onAddLink={l => setLinks([...links, l])} onRemoveLink={i => setLinks(links.filter((_, j) => j !== i))} />
        </div>
      )}

      {activeTab === 'video' && (
        <div className="p-4 bg-[rgba(99,102,241,0.04)] rounded-xl border border-[rgba(99,102,241,0.12)]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#818cf8]/70">แนบวิดีโอ</span>
            <button type="button" onClick={() => setActiveTab(null)} className="text-[10px] font-medium text-white/38 hover:text-white/65 transition-colors">ปิด ×</button>
          </div>
          <LinkAttachment type="video" links={videos} onAddLink={l => setVideos([...videos, l])} onRemoveLink={i => setVideos(videos.filter((_, j) => j !== i))} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex gap-2">
          {tabBtn('image', ImageIcon, 'รูปภาพ', imageUpload.files.length)}
          {tabBtn('link',  Link2,    'ลิงก์',   links.length)}
          {tabBtn('video', Film,     'วิดีโอ',  videos.length)}
        </div>

        <div className="flex gap-2 justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
            onClick={() => {
              if (hasContent) {
                if (window.confirm('ยกเลิกการเขียนโพสต์?')) {
                  setExpanded(false); setTitle(''); setDescription('');
                  imageUpload.reset(); setLinks([]); setVideos([]);
                }
              } else {
                setExpanded(false);
              }
            }}
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!title.trim() || isSubmitting}
            loading={isSubmitting}
          >
            โพสต์
          </Button>
        </div>
      </div>
    </div>
  );
};
