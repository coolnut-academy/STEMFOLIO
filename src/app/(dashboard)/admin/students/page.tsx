"use client";

import React, { useState } from 'react';
import { useStudents } from '@/hooks/useStudents';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import { Search, Plus, Trash2, Edit2, UserPlus } from 'lucide-react';
import { User } from '@/types';
import { updateUser, deleteStudent } from '@/lib/firestore/users';
import { useToast } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export default function StudentsPage() {
  const { students, loading, search, refresh } = useStudents();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<User | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingStudentId, setDeletingStudentId] = useState<string | null>(null);

  const [editFormData, setEditFormData] = useState({
    name: '',
    nickname: '',
    studentId: '',
    classRoom: '',
    phone: '',
  });

  const [addFormData, setAddFormData] = useState({
    name: '',
    surname: '',
    studentId: '',
    classRoom: '',
    email: '',
  });
  const [isAddLoading, setIsAddLoading] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    search(val);
  };

  const openEdit = (student: User) => {
    setEditingStudent(student);
    setEditFormData({
      name: student.name,
      nickname: student.nickname || '',
      studentId: student.studentId || '',
      classRoom: student.classRoom || '',
      phone: student.phone || '',
    });
    setIsEditOpen(true);
  };

  const openAdd = () => {
    setAddFormData({ name: '', surname: '', studentId: '', classRoom: '', email: '' });
    setIsAddOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      await updateUser(editingStudent.id, editFormData);
      showToast('อัปเดตข้อมูลนักเรียนสำเร็จ', 'success');
      setIsEditOpen(false);
      refresh();
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.name || !addFormData.surname || !addFormData.studentId) {
      showToast('กรุณากรอกชื่อ นามสกุล และเลขประจำตัว', 'error');
      return;
    }
    setIsAddLoading(true);
    try {
      const createFn = httpsCallable(functions, 'createOriginalStudent');
      await createFn(addFormData);
      showToast(`เพิ่มนักเรียน ${addFormData.name} ${addFormData.surname} สำเร็จ`, 'success');
      setIsAddOpen(false);
      refresh();
    } catch (error: any) {
      const code = error?.code ?? '';
      if (code === 'functions/already-exists') {
        showToast('เลขประจำตัวนี้มีในระบบแล้ว', 'error');
      } else {
        console.error(error);
        showToast('เกิดข้อผิดพลาดในการเพิ่มนักเรียน', 'error');
      }
    } finally {
      setIsAddLoading(false);
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
      setIsEditOpen(false);
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
          <h1 className="text-2xl font-bold text-white">จัดการนักเรียน</h1>
          <p className="text-sm text-white/50">รายชื่อนักเรียนทั้งหมดในระบบ</p>
        </div>
        <Button onClick={openAdd} className="gap-2">
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
            <thead className="text-xs text-white/50 uppercase bg-white/5">
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
                  <td colSpan={5} className="px-4 py-8 text-center text-white/50">
                    ไม่พบข้อมูลนักเรียน
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-b border-white/10 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">
                      {student.name} {student.nickname ? `(${student.nickname})` : ''}
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-white/50 font-normal">{student.email || '-'}</span>
                        {student.loginType === 'original' && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase tracking-wide">Original</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">{student.studentId || '-'}</td>
                    <td className="px-4 py-3">{student.classRoom || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {student.projectIds && student.projectIds.length > 0 ? (
                          student.projectIds.map(pid => (
                            <Badge key={pid} variant="blue">{pid.slice(0, 6)}...</Badge>
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

      {/* Add Original Student Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="เพิ่มนักเรียน (Original Mode)">
        <form onSubmit={handleAddStudent} className="flex flex-col gap-4">
          <p className="text-sm text-white/60">
            นักเรียนจะสามารถเข้าสู่ระบบด้วยเลขประจำตัวนักเรียนได้ทันที โดยไม่ต้องใช้ Google
          </p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ชื่อ *"
              placeholder="สมชาย"
              value={addFormData.name}
              onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
              required
              disabled={isAddLoading}
            />
            <Input
              label="นามสกุล *"
              placeholder="ใจดี"
              value={addFormData.surname}
              onChange={e => setAddFormData({ ...addFormData, surname: e.target.value })}
              required
              disabled={isAddLoading}
            />
          </div>
          <Input
            label="เลขประจำตัวนักเรียน *"
            placeholder="เช่น 12345"
            value={addFormData.studentId}
            onChange={e => setAddFormData({ ...addFormData, studentId: e.target.value })}
            required
            disabled={isAddLoading}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="ห้องเรียน"
              placeholder="เช่น ม.5/1"
              value={addFormData.classRoom}
              onChange={e => setAddFormData({ ...addFormData, classRoom: e.target.value })}
              disabled={isAddLoading}
            />
            <Input
              label="อีเมล (ไม่บังคับ)"
              type="email"
              placeholder="student@school.ac.th"
              value={addFormData.email}
              onChange={e => setAddFormData({ ...addFormData, email: e.target.value })}
              disabled={isAddLoading}
            />
          </div>
          <div className="flex justify-end gap-2 mt-2 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} disabled={isAddLoading}>ยกเลิก</Button>
            <Button type="submit" loading={isAddLoading} className="gap-2">
              <UserPlus className="w-4 h-4" />
              {isAddLoading ? 'กำลังเพิ่ม…' : 'เพิ่มนักเรียน'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="แก้ไขข้อมูลนักเรียน">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input label="ชื่อ-นามสกุล *" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="ชื่อเล่น" value={editFormData.nickname} onChange={e => setEditFormData({ ...editFormData, nickname: e.target.value })} />
            <Input label="เลขประจำตัว" value={editFormData.studentId} onChange={e => setEditFormData({ ...editFormData, studentId: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="ห้องเรียน" value={editFormData.classRoom} onChange={e => setEditFormData({ ...editFormData, classRoom: e.target.value })} />
            <Input label="เบอร์โทรศัพท์" value={editFormData.phone} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} />
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <Button type="button" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => confirmDelete(editingStudent?.id!)}>
              <Trash2 className="w-4 h-4 mr-2" /> ลบออกจากระบบ
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditOpen(false)}>ยกเลิก</Button>
              <Button type="submit">บันทึก</Button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="ยืนยันการลบนักเรียน"
        message="การลบนักเรียนจะลบข้อมูลและบัญชีผู้ใช้ออกจากระบบถาวร รวมถึงนำออกจากโครงงานทั้งหมด ยืนยันหรือไม่?"
        isDanger={true}
        confirmText="ลบนักเรียน"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
