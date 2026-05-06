"use client";

import React, { useState } from 'react';
import { useAdvisors } from '@/hooks/useAdvisors';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { Advisor } from '@/types';
import { createAdvisor, updateAdvisor, deleteAdvisor } from '@/lib/firestore/advisors';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/hooks/useAuth';

export default function AdvisorsPage() {
  const { user } = useAuth();
  const { advisors, loading, search, refresh } = useAdvisors();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    department: '',
    phone: '',
    email: '',
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    search(val);
  };

  const openCreate = () => {
    setEditingId(null);
    setFormData({ title: '', name: '', department: '', phone: '', email: '' });
    setIsFormOpen(true);
  };

  const openEdit = (advisor: Advisor) => {
    setEditingId(advisor.id);
    setFormData({
      title: advisor.title || '',
      name: advisor.name,
      department: advisor.department || '',
      phone: advisor.phone || '',
      email: advisor.email || '',
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAdvisor(editingId, formData);
        showToast('อัปเดตข้อมูลครูที่ปรึกษาสำเร็จ', 'success');
      } else {
        await createAdvisor({ ...formData, createdBy: user!.uid });
        showToast('เพิ่มครูที่ปรึกษาใหม่สำเร็จ', 'success');
      }
      setIsFormOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteAdvisor(deletingId);
      showToast('ลบครูที่ปรึกษาสำเร็จ', 'success');
      setIsConfirmOpen(false);
      setIsFormOpen(false);
      refresh();
    } catch (error: any) {
      console.error(error);
      showToast(error.message || 'เกิดข้อผิดพลาดในการลบ', 'error');
      setIsConfirmOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการครูที่ปรึกษา</h1>
          <p className="text-sm text-gray-500">รายชื่อครูที่ปรึกษาโครงงาน</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> เพิ่มครูที่ปรึกษา
        </Button>
      </div>

      <GlassCard className="p-4 md:p-6 flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="ค้นหาชื่อ..." 
            className="pl-9"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">ชื่อ-นามสกุล</th>
                <th className="px-4 py-3">สังกัด/กลุ่มสาระ</th>
                <th className="px-4 py-3">อีเมล</th>
                <th className="px-4 py-3">เบอร์โทร</th>
                <th className="px-4 py-3 rounded-tr-lg text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center">
                    <Spinner className="mx-auto text-[var(--accent-blue)]" />
                  </td>
                </tr>
              ) : advisors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลครูที่ปรึกษา
                  </td>
                </tr>
              ) : (
                advisors.map((advisor) => (
                  <tr key={advisor.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {advisor.title} {advisor.name}
                    </td>
                    <td className="px-4 py-3">{advisor.department || '-'}</td>
                    <td className="px-4 py-3">{advisor.email || '-'}</td>
                    <td className="px-4 py-3">{advisor.phone || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(advisor)} className="p-2 h-auto text-blue-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={editingId ? "แก้ไขข้อมูลครูที่ปรึกษา" : "เพิ่มครูที่ปรึกษาใหม่"}>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <Input className="col-span-1" label="คำนำหน้า" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="นาย/นาง/นางสาว" />
            <Input className="col-span-2" label="ชื่อ-นามสกุล *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <Input label="สังกัด/กลุ่มสาระ" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="เบอร์โทรศัพท์" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            <Input label="อีเมล" type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            {editingId ? (
              <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => confirmDelete(editingId)}>
                <Trash2 className="w-4 h-4 mr-2" /> ลบข้อมูล
              </Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>ยกเลิก</Button>
              <Button type="submit">บันทึก</Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="ยืนยันการลบครูที่ปรึกษา"
        message="คุณต้องการลบครูที่ปรึกษาท่านนี้ออกจากระบบใช่หรือไม่?"
        isDanger={true}
        confirmText="ลบ"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
