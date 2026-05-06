import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { createEvent, listSubmissionEvents } from '@/lib/firestore/timeline';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';
import { TimelineEvent } from '@/types';

interface ResultFormProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResultForm = ({ projectId, isOpen, onClose, onSuccess }: ResultFormProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [submissions, setSubmissions] = useState<TimelineEvent[]>([]);
  
  const [formData, setFormData] = useState({
    linkedSubmissionId: '',
    competitionName: '',
    result: 'pending' as 'pending' | 'pass' | 'fail' | 'award',
    announcementUrl: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      listSubmissionEvents(projectId).then(setSubmissions);
    }
  }, [isOpen, projectId]);

  const handleSubmissionSelect = (subId: string) => {
    const sub = submissions.find(s => s.id === subId);
    setFormData({
      ...formData,
      linkedSubmissionId: subId,
      competitionName: sub ? sub.competitionName || '' : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await createEvent(projectId, {
        type: 'result',
        title: `ประกาศผล: ${formData.competitionName}`,
        competitionName: formData.competitionName,
        linkedSubmissionId: formData.linkedSubmissionId,
        result: formData.result,
        announcementUrl: formData.announcementUrl,
        description: formData.description,
        isHighlight: false,
        attachments: [],
        createdBy: user.uid,
      });
      
      showToast('เพิ่มประกาศผลสำเร็จ', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="เพิ่มผลการแข่งขัน">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select 
          label="เลือกการส่งแข่งที่ต้องการอัปเดตผล"
          value={formData.linkedSubmissionId}
          onChange={e => handleSubmissionSelect(e.target.value)}
          options={[
            { label: 'ไม่ระบุเวที (สร้างผลใหม่)', value: '' },
            ...submissions.map(s => ({ label: s.competitionName || s.title, value: s.id }))
          ]}
        />
        
        <Input 
          label="ชื่อเวที *" 
          value={formData.competitionName} 
          onChange={e => setFormData({...formData, competitionName: e.target.value})} 
          required 
        />
        
        <Select 
          label="ผลลัพธ์ *" 
          value={formData.result}
          onChange={e => setFormData({...formData, result: e.target.value as any})}
          options={[
            { label: 'รอดำเนินการ', value: 'pending' },
            { label: 'ผ่านการคัดเลือก', value: 'pass' },
            { label: 'ไม่ผ่าน', value: 'fail' },
            { label: 'ได้รับรางวัล', value: 'award' },
          ]}
          required
        />
        
        <Input 
          label="ลิงก์ประกาศผล" 
          value={formData.announcementUrl} 
          onChange={e => setFormData({...formData, announcementUrl: e.target.value})} 
        />
        
        <TextArea 
          label="รายละเอียดเพิ่มเติม" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>ยกเลิก</Button>
          <Button type="submit" loading={loading} disabled={!formData.competitionName}>บันทึก</Button>
        </div>
      </form>
    </Modal>
  );
};
