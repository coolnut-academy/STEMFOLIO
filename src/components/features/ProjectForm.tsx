"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Select } from '@/components/ui/Select';
import { useToast } from '@/components/ui/Toast';
import { createProject, updateProject, archiveProject } from '@/lib/firestore/projects';
import { generateInviteCode } from '@/lib/firestore/inviteCodes';
import { getCategories } from '@/lib/firestore/settings';
import { Project, Advisor, User } from '@/types';
import { useAdvisors } from '@/hooks/useAdvisors';
import { useStudents } from '@/hooks/useStudents';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/Badge';
import { X, Plus, Copy } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

interface ProjectFormProps {
  initialData?: Project;
}

export const ProjectForm = ({ initialData }: ProjectFormProps) => {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<string[]>([]);
  const { advisors } = useAdvisors();
  const { students } = useStudents();
  
  const currentYear = new Date().getFullYear() + 543;
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    titleEn: initialData?.titleEn || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    academicYear: initialData?.academicYear || currentYear.toString(),
    isPublic: initialData?.isPublic ?? false,
    status: initialData?.status || 'active',
  });

  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>(initialData?.advisorIds || []);
  const [selectedStudents, setSelectedStudents] = useState<string[]>(initialData?.studentIds || []);
  
  const [isLoading, setIsLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [isConfirmArchiveOpen, setIsConfirmArchiveOpen] = useState(false);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category || !formData.academicYear) {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
      return;
    }

    setIsLoading(true);
    try {
      if (initialData) {
        await updateProject(initialData.id, {
          ...formData,
          advisorIds: selectedAdvisors,
          studentIds: selectedStudents,
        });
        showToast('อัปเดตโครงงานสำเร็จ', 'success');
        router.push(`/project/${initialData.id}`);
      } else {
        const projectId = await createProject({
          ...formData,
          status: 'active',
          advisorIds: selectedAdvisors,
          studentIds: selectedStudents,
          createdBy: user!.uid,
        });
        showToast('สร้างโครงงานสำเร็จ', 'success');
        router.push('/admin/projects');
      }
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInvite = async () => {
    if (!initialData) {
      showToast('ต้องบันทึกโครงงานก่อนสร้าง Invite Code', 'info');
      return;
    }
    setIsLoading(true);
    try {
      const code = await generateInviteCode(initialData.id, user!.uid, 5); // Default max 5
      setInviteCode(code);
      showToast('สร้าง Invite Code สำเร็จ', 'success');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!initialData) return;
    try {
      await archiveProject(initialData.id);
      showToast('จัดเก็บโครงงานสำเร็จ', 'success');
      router.push('/admin/projects');
    } catch (error) {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-8 max-w-4xl">
      <GlassCard className="p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold border-b border-[var(--glass-border)] pb-2">1. ข้อมูลโครงงาน</h2>
        
        <Input label="ชื่อโครงงาน (TH) *" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
        <Input label="ชื่อโครงงาน (EN)" value={formData.titleEn} onChange={e => setFormData({...formData, titleEn: e.target.value})} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label="หมวดหมู่ *" 
            options={[{label: 'เลือกหมวดหมู่', value: ''}, ...categories.map(c => ({label: c, value: c}))]}
            value={formData.category}
            onChange={e => setFormData({...formData, category: e.target.value})}
            required
          />
          <Input 
            label="ปีการศึกษา *" 
            value={formData.academicYear} 
            onChange={e => setFormData({...formData, academicYear: e.target.value})} 
            required 
          />
        </div>

        <TextArea label="คำอธิบายสั้นๆ" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        
        <label className="flex items-center gap-2 mt-2 cursor-pointer">
          <input type="checkbox" checked={formData.isPublic} onChange={e => setFormData({...formData, isPublic: e.target.checked})} className="rounded text-[var(--accent-blue)]" />
          <span className="text-sm font-medium">เปิดเผยเป็นสาธารณะ (Portfolio Sharing)</span>
        </label>
      </GlassCard>

      <GlassCard className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold border-b border-[var(--glass-border)] pb-2">2. ครูที่ปรึกษา</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedAdvisors.map(id => {
            const adv = advisors.find(a => a.id === id);
            return (
              <Badge key={id} variant="blue" className="flex items-center gap-1 py-1">
                {adv ? `${adv.title}${adv.name}` : id}
                <button type="button" onClick={() => setSelectedAdvisors(prev => prev.filter(a => a !== id))}><X className="w-3 h-3" /></button>
              </Badge>
            );
          })}
        </div>
        <Select 
          label="เพิ่มครูที่ปรึกษา"
          options={[{label: 'เลือกครูที่ปรึกษา', value: ''}, ...advisors.filter(a => !selectedAdvisors.includes(a.id)).map(a => ({label: `${a.title}${a.name}`, value: a.id}))]}
          onChange={(e) => {
            if (e.target.value) {
              setSelectedAdvisors([...selectedAdvisors, e.target.value]);
              e.target.value = '';
            }
          }}
        />
      </GlassCard>

      <GlassCard className="p-6 flex flex-col gap-4">
        <h2 className="text-xl font-bold border-b border-[var(--glass-border)] pb-2">3. นักเรียน & Invite Code</h2>
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedStudents.map(id => {
            const std = students.find(s => s.id === id);
            return (
              <Badge key={id} variant="green" className="flex items-center gap-1 py-1">
                {std ? std.name : id}
                <button type="button" onClick={() => setSelectedStudents(prev => prev.filter(s => s !== id))}><X className="w-3 h-3" /></button>
              </Badge>
            );
          })}
        </div>
        <Select 
          label="เพิ่มนักเรียนเข้าร่วม"
          options={[{label: 'เลือกนักเรียน', value: ''}, ...students.filter(s => !selectedStudents.includes(s.id)).map(s => ({label: s.name, value: s.id}))]}
          onChange={(e) => {
            if (e.target.value) {
              setSelectedStudents([...selectedStudents, e.target.value]);
              e.target.value = '';
            }
          }}
        />

        {initialData && (
          <div className="mt-4 p-4 border border-blue-100 bg-blue-50/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Invite Code</p>
                <p className="text-sm text-blue-700">สร้างรหัสเพื่อให้นักเรียนเข้าร่วมโครงงานด้วยตนเอง</p>
              </div>
              {!inviteCode ? (
                <Button type="button" onClick={handleGenerateInvite} variant="secondary" size="sm" loading={isLoading}>สร้าง Code</Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-mono font-bold tracking-widest text-blue-600">{inviteCode}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => {navigator.clipboard.writeText(inviteCode); showToast('Copied!', 'success');}}><Copy className="w-4 h-4" /></Button>
                </div>
              )}
            </div>
          </div>
        )}
      </GlassCard>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        {initialData ? (
          <Button type="button" variant="danger" onClick={() => setIsConfirmArchiveOpen(true)}>จัดเก็บ (Archive)</Button>
        ) : <div />}
        <div className="flex gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>ยกเลิก</Button>
          <Button type="submit" loading={isLoading}>บันทึกโครงงาน</Button>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={isConfirmArchiveOpen}
        title="จัดเก็บโครงงาน"
        message="แน่ใจหรือไม่ว่าต้องการจัดเก็บโครงงานนี้? โครงงานที่จัดเก็บจะไปอยู่ในหมวดหมู่จัดเก็บแล้ว"
        onConfirm={handleArchive}
        onCancel={() => setIsConfirmArchiveOpen(false)}
        confirmText="จัดเก็บ"
      />
    </form>
  );
};
