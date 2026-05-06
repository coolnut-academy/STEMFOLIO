import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { InviteCode, Project } from '@/types';
import { linkStudentToProject } from './users';

export const generateInviteCode = async (projectId: string, createdBy: string, maxUses: number = 1): Promise<string> => {
  // Generate random 6 characters uppercase alphanumeric
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  const newRef = doc(collection(db, 'inviteCodes'), code);
  const inviteCode: InviteCode = {
    code,
    projectId,
    createdBy,
    maxUses,
    usedCount: 0,
    usedBy: [],
    createdAt: serverTimestamp() as any,
  };
  await setDoc(newRef, inviteCode);
  return code;
};

export const validateCode = async (code: string): Promise<{ valid: boolean; project?: Project; remaining?: number }> => {
  const q = query(collection(db, 'inviteCodes'), where('code', '==', code.toUpperCase()));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return { valid: false };
  }

  const inviteDoc = snapshot.docs[0];
  const inviteData = inviteDoc.data() as InviteCode;

  if (inviteData.usedCount >= inviteData.maxUses) {
    return { valid: false, remaining: 0 };
  }

  const projectRef = doc(db, 'projects', inviteData.projectId);
  const projectSnap = await getDoc(projectRef);

  if (!projectSnap.exists()) {
    return { valid: false };
  }

  return {
    valid: true,
    project: projectSnap.data() as Project,
    remaining: inviteData.maxUses - inviteData.usedCount
  };
};

export const redeemCode = async (code: string, userId: string): Promise<void> => {
  const validation = await validateCode(code);
  if (!validation.valid || !validation.project) {
    throw new Error('โค้ดไม่ถูกต้องหรือหมดอายุแล้ว');
  }

  const q = query(collection(db, 'inviteCodes'), where('code', '==', code.toUpperCase()));
  const snapshot = await getDocs(q);
  const inviteDoc = snapshot.docs[0];
  const inviteData = inviteDoc.data() as InviteCode;

  if (inviteData.usedBy.includes(userId)) {
    throw new Error('คุณเคยใช้โค้ดนี้ไปแล้ว');
  }

  // Update invite code
  await updateDoc(inviteDoc.ref, {
    usedCount: inviteData.usedCount + 1,
    usedBy: [...inviteData.usedBy, userId]
  });

  // Link student to project
  await linkStudentToProject(userId, inviteData.projectId);
};
