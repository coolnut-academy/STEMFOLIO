"use client";

import React, { useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Trash2, Edit2 } from 'lucide-react';
import { User } from '@/types';
import { updateUser, deleteStudent } from '@/lib/firestore/users';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function StudentsPage() {
  const { students, loading, search, refresh } = useStudents();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    studentId: '',
    classRoom: '',
    phone: '',
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    search(val);
  };

  const openEdit = (student: User) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      nickname: student.nickname || '',
      studentId: student.studentId || '',
      classRoom: student.classRoom || '',
      phone: student.phone || '',
    });
    setIsFormOpen(true);
  };

  // Note: App adds students via "Join Project" or manual auth creation. 
  // For admin manual add, it requires calling Firebase Auth to create the account,
  // which normally is done client-side if they use join page, or via cloud function.
  // We'll leave the "Add Student" button as a placeholder or info for Phase 2 as per spec.
  const openCreate = () => {
    showToast('การเพิ่มนักเรียนใหม่ ให้นักเรียนสมัครผ่านหน้าเข้าสู่ระบบ', 'info');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    
    try {
      await updateUser(editingStudent.id, formData);
      showToast('อัปเดตข้อมูลนักเรียนสำเร็จ', 'success');
      setIsFormOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  const confirmDelete = (id: string) => {
    setDeletingStudentId(id);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingStudentId) return;
    try {
      await deleteStudent(deletingStudentId);
      showToast('ลบนักเรียนออกจากระบบสำเร็จ', 'success');
      setIsConfirmOpen(false);
      setIsFormOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการลบ', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">จัดการนักเรียน</h1>
          <p className="text-sm text-gray-500">รายชื่อนักเรียนทั้งหมดในระบบ</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" /> เพิ่มนักเรียน
        </Button>
      </div>

      <GlassCard className="p-4 md:p-6 flex flex-col gap-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="ค้นหาชื่อ, เลขประจำตัว..." 
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
                <th className="px-4 py-3">เลขประจำตัว</th>
                <th className="px-4 py-3">ห้องเรียน</th>
                <th className="px-4 py-3">โครงงาน</th>
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    ไม่พบข้อมูลนักเรียน
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {student.name} {student.nickname ? `(${student.nickname})` : ''}
                      <div className="text-xs text-gray-500 font-normal">{student.email}</div>
                    </td>
                    <td className="px-4 py-3">{student.studentId || '-'}</td>
                    <td className="px-4 py-3">{student.classRoom || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {student.projectIds && student.projectIds.length > 0 ? (
                          student.projectIds.map(pid => (
                            <Badge key={pid} variant="blue">{pid.slice(0,6)}...</Badge>
                          ))
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(student)} className="p-2 h-auto text-blue-600">
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

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="แก้ไขข้อมูลนักเรียน">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="ชื่อ-นามสกุล *" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="ชื่อเล่น" value={formData.nickname} onChange={e => setFormData({...formData, nickname: e.target.value})} />
            <Input label="เลขประจำตัว" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="ห้องเรียน" value={formData.classRoom} onChange={e => setFormData({...formData, classRoom: e.target.value})} />
            <Input label="เบอร์โทรศัพท์" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => confirmDelete(editingStudent?.id!)}>
              <Trash2 className="w-4 h-4 mr-2" /> ลบออกจากระบบ
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>ยกเลิก</Button>
              <Button type="submit">บันทึก</Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="ยืนยันการลบนักเรียน"
        message="การลบนักเรียนจะนำนักเรียนออกจากโครงงานทั้งหมด แต่จะไม่ลบบัญชีผู้ใช้ (Soft Delete) ยืนยันหรือไม่?"
        isDanger={true}
        confirmText="ลบนักเรียน"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
