import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { Advisor } from '@/types';

export const createAdvisor = async (data: Omit<Advisor, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const newRef = doc(collection(db, 'advisors'));
  const advisor: Advisor = {
    ...data,
    id: newRef.id,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };
  await setDoc(newRef, advisor);
  return newRef.id;
};

export const getAdvisor = async (advisorId: string): Promise<Advisor | null> => {
  const docRef = doc(db, 'advisors', advisorId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as Advisor) : null;
};

export const updateAdvisor = async (advisorId: string, data: Partial<Advisor>): Promise<void> => {
  const docRef = doc(db, 'advisors', advisorId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const listAdvisors = async (): Promise<Advisor[]> => {
  const snapshot = await getDocs(collection(db, 'advisors'));
  return snapshot.docs.map(doc => doc.data() as Advisor);
};

export const deleteAdvisor = async (advisorId: string): Promise<void> => {
  // Check if advisor has any project references
  const q = query(collection(db, 'projects'), where('advisorIds', 'array-contains', advisorId));
  const projectsSnap = await getDocs(q);
  
  if (!projectsSnap.empty) {
    throw new Error('ไม่สามารถลบได้ เนื่องจากครูที่ปรึกษาท่านนี้มีโครงงานที่ดูแลอยู่');
  }

  const docRef = doc(db, 'advisors', advisorId);
  await deleteDoc(docRef);
};

export const searchAdvisors = async (searchQuery: string): Promise<Advisor[]> => {
  const advisors = await listAdvisors();
  const lowerQuery = searchQuery.toLowerCase();
  return advisors.filter(advisor => 
    advisor.name.toLowerCase().includes(lowerQuery)
  );
};
