import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { createEvent } from '@/lib/firestore/timeline';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/Toast';

interface SubmissionFormProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmissionForm = ({ projectId, isOpen, onClose, onSuccess }: SubmissionFormProps) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    competitionName: '',
    deadline: null as Date | null,
    submittedDate: null as Date | null,
    submissionStatus: 'draft' as 'draft' | 'submitted',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.competitionName || !user) return;
    
    setLoading(true);
    try {
      await createEvent(projectId, {
        type: 'submission',
        title: formData.title || `ส่งเข้าร่วม: ${formData.competitionName}`,
        competitionName: formData.competitionName,
        deadline: formData.deadline as any, // FireStore automatically handles Date objects if passed via helper, but better to convert to Timestamp if needed. Next.js/Firestore sdk handles Date -> Timestamp.
        submittedDate: formData.submittedDate as any,
        submissionStatus: formData.submissionStatus,
        description: formData.description,
        isHighlight: false,
        attachments: [],
        createdBy: user.uid,
      });
      
      showToast('เพิ่มการส่งแข่งสำเร็จ', 'success');
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
    <Modal isOpen={isOpen} onClose={onClose} title="เพิ่มการส่งแข่ง">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input 
          label="หัวข้อ (ไม่บังคับ)" 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          placeholder="เช่น อัปเดตการส่งโครงงาน"
        />
        <Input 
          label="ชื่อเวทีการแข่งขัน *" 
          value={formData.competitionName} 
          onChange={e => setFormData({...formData, competitionName: e.target.value})} 
          required 
        />
        
        <div className="grid grid-cols-2 gap-4">
          <DatePicker 
            label="Deadline (ไม่บังคับ)" 
            value={formData.deadline} 
            onChange={d => setFormData({...formData, deadline: d})} 
          />
          <Select 
            label="สถานะ" 
            value={formData.submissionStatus}
            onChange={e => setFormData({...formData, submissionStatus: e.target.value as any})}
            options={[
              { label: 'เตรียมตัว (Draft)', value: 'draft' },
              { label: 'ส่งแล้ว (Submitted)', value: 'submitted' },
            ]}
          />
        </div>
        
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
