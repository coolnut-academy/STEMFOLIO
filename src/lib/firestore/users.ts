import { db } from '../firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User } from '@/types';

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as User) : null;
};

export const updateUser = async (userId: string, data: Partial<User>): Promise<void> => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, data as any);
};

export const listStudents = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as User);
};

export const searchStudents = async (searchQuery: string): Promise<User[]> => {
  // In a real production app, use Algolia or Typesense for text search.
  // Here, we fetch all students and filter locally since Firestore doesn't support full-text search easily.
  const students = await listStudents();
  const lowerQuery = searchQuery.toLowerCase();
  return students.filter(student => 
    student.name.toLowerCase().includes(lowerQuery) || 
    (student.nickname && student.nickname.toLowerCase().includes(lowerQuery)) ||
    (student.email && student.email.toLowerCase().includes(lowerQuery))
  );
};

export const deleteStudent = async (userId: string): Promise<void> => {
  const user = await getUser(userId);
  if (!user) return;

  // Soft delete: Remove from all projects' studentIds
  // and clear user's projectIds
  const projectIds = user.projectIds || [];
  
  for (const projectId of projectIds) {
    const projectRef = doc(db, 'projects', projectId);
    const projectSnap = await getDoc(projectRef);
    if (projectSnap.exists()) {
      const projectData = projectSnap.data();
      const studentIds = projectData.studentIds || [];
      const updatedStudentIds = studentIds.filter((id: string) => id !== userId);
      await updateDoc(projectRef, { studentIds: updatedStudentIds });
    }
  }

  // Clear projectIds from user
  await updateUser(userId, { projectIds: [] });
};

export const linkStudentToProject = async (userId: string, projectId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data() as User;
    if (!userData.projectIds.includes(projectId)) {
      await updateDoc(userRef, { projectIds: [...userData.projectIds, projectId] });
    }
  }

  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);
  if (projectSnap.exists()) {
    const projectData = projectSnap.data();
    if (!projectData.studentIds.includes(userId)) {
      await updateDoc(projectRef, { studentIds: [...projectData.studentIds, userId] });
    }
  }
};

export const unlinkStudentFromProject = async (userId: string, projectId: string): Promise<void> => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data() as User;
    await updateDoc(userRef, { 
      projectIds: userData.projectIds.filter(id => id !== projectId) 
    });
  }

  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);
  if (projectSnap.exists()) {
    const projectData = projectSnap.data();
    await updateDoc(projectRef, { 
      studentIds: projectData.studentIds.filter((id: string) => id !== userId) 
    });
  }
};
