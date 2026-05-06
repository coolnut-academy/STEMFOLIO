"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, getDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { InviteCode, Project } from '@/types';

export default function JoinPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState('');
  const [inviteData, setInviteData] = useState<InviteCode | null>(null);
  const [projectData, setProjectData] = useState<Project | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, signUp, userDoc } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    try {
      // 1. Fetch invite code
      const q = query(collection(db, 'inviteCodes'), where('code', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        showToast('ไม่พบรหัส Invite Code นี้', 'error');
        setIsLoading(false);
        return;
      }

      const inviteDoc = querySnapshot.docs[0];
      const data = inviteDoc.data() as InviteCode;

      if (data.usedCount >= data.maxUses) {
        showToast('Invite Code นี้ถูกใช้งานครบจำนวนแล้ว', 'error');
        setIsLoading(false);
        return;
      }

      // 2. Fetch project details
      const projectRef = doc(db, 'projects', data.projectId);
      const projectSnap = await getDoc(projectRef); // Need to import getDoc
      
      if (!projectSnap.exists()) {
        showToast('ไม่พบข้อมูลโครงงาน', 'error');
        setIsLoading(false);
        return;
      }

      setInviteData({ ...data, id: inviteDoc.id } as InviteCode & { id: string });
      setProjectData(projectSnap.data() as Project);
      setStep(2);
    } catch (error) {
      console.error(error);
      showToast('เกิดข้อผิดพลาดในการตรวจสอบรหัส', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteData || !projectData) return;

    setIsLoading(true);
    try {
      let currentUserId = user?.uid;

      if (!user) {
        // Create new account
        if (!email || !password || !name) {
          showToast('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
          setIsLoading(false);
          return;
        }
        const newUser = await signUp(email, password, name, nickname);
        currentUserId = newUser.uid;
      } else {
        // User already logged in, check if already in project
        if (userDoc?.projectIds.includes(projectData.id)) {
          showToast('คุณอยู่ในโครงงานนี้อยู่แล้ว', 'info');
          router.push('/student');
          return;
        }
      }

      // Link student to project and update invite code
      // We do this manually here for Phase 1, in Phase 2 there will be helper functions
      const userRef = doc(db, 'users', currentUserId!);
      await updateDoc(userRef, {
        projectIds: arrayUnion(projectData.id)
      });

      const projectRef = doc(db, 'projects', projectData.id);
      await updateDoc(projectRef, {
        studentIds: arrayUnion(currentUserId!)
      });

      const inviteRef = doc(db, 'inviteCodes', (inviteData as any).id);
      await updateDoc(inviteRef, {
        usedCount: inviteData.usedCount + 1,
        usedBy: arrayUnion(currentUserId!)
      });

      showToast('เข้าร่วมโครงงานสำเร็จ!', 'success');
      router.push('/student');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/email-already-in-use') {
        showToast('อีเมลนี้ถูกใช้งานแล้ว กรุณาเข้าสู่ระบบก่อน', 'error');
      } else {
        showToast('เกิดข้อผิดพลาดในการเข้าร่วมโครงงาน', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md p-8">
        {step === 1 && (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">เข้าร่วมโครงงาน</h1>
              <p className="text-gray-500 mt-2">กรอก Invite Code ที่ได้รับจากครูที่ปรึกษา</p>
            </div>

            <form onSubmit={handleValidateCode} className="flex flex-col gap-5">
              <Input 
                label="Invite Code" 
                placeholder="ABC123"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isLoading}
                className="text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />
              <Button type="submit" className="w-full" loading={isLoading}>
                ตรวจสอบรหัส
              </Button>
            </form>
          </>
        )}

        {step === 2 && projectData && (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">โครงงาน: {projectData.title}</h2>
              <p className="text-sm text-gray-500">
                {user ? 'ยืนยันการเข้าร่วมโครงงานด้วยบัญชีปัจจุบัน' : 'สร้างบัญชีเพื่อเข้าร่วมโครงงาน'}
              </p>
            </div>

            <form onSubmit={handleJoin} className="flex flex-col gap-4">
              {!user && (
                <>
                  <Input 
                    label="ชื่อ-นามสกุล *" 
                    placeholder="สมชาย ใจดี"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Input 
                    label="ชื่อเล่น" 
                    placeholder="ชาย"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    disabled={isLoading}
                  />
                  <Input 
                    label="อีเมล *" 
                    type="email" 
                    placeholder="student@school.ac.th"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                  <Input 
                    label="รหัสผ่าน *" 
                    type="password" 
                    placeholder="ตั้งรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    required
                  />
                </>
              )}

              {user && (
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-[var(--radius-card)] text-center text-sm text-blue-800">
                  คุณกำลังเข้าสู่ระบบด้วยอีเมล: <br/> <strong>{user.email}</strong>
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="flex-1"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  ย้อนกลับ
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1"
                  loading={isLoading}
                >
                  {user ? 'เข้าร่วมโครงงาน' : 'สร้างบัญชี & เข้าร่วม'}
                </Button>
              </div>
            </form>
          </>
        )}
      </GlassCard>
    </div>
  );
}
