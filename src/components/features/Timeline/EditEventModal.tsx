import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { TextArea } from '@/components/ui/TextArea';
import { Button } from '@/components/ui/Button';
import { updateEvent } from '@/lib/firestore/timeline';
import { useToast } from '@/components/ui/Toast';
import { TimelineEvent } from '@/types';

interface EditEventModalProps {
  projectId: string;
  event: TimelineEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditEventModal = ({ projectId, event, isOpen, onClose, onSuccess }: EditEventModalProps) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });

  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        title: event.title,
        description: event.description || '',
      });
    }
  }, [event, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;
    
    setLoading(true);
    try {
      await updateEvent(projectId, event.id, {
        title: formData.title,
        description: formData.description,
      });
      
      showToast('อัปเดตโพสต์สำเร็จ', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาด', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="แก้ไขโพสต์">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input 
          label="หัวข้อ *" 
          value={formData.title} 
          onChange={e => setFormData({...formData, title: e.target.value})} 
          required 
        />
        
        <TextArea 
          label="รายละเอียด" 
          value={formData.description} 
          onChange={e => setFormData({...formData, description: e.target.value})} 
          rows={5}
        />
        
        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="ghost" onClick={onClose}>ยกเลิก</Button>
          <Button type="submit" loading={loading} disabled={!formData.title}>บันทึก</Button>
        </div>
      </form>
    </Modal>
  );
};
