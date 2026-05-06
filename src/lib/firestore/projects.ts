import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { Project } from '@/types';
import { linkStudentToProject } from './users';

export const createProject = async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const newRef = doc(collection(db, 'projects'));
  const project: Project = {
    ...data,
    id: newRef.id,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };
  await setDoc(newRef, project);

  // Link any students specified during creation
  if (data.studentIds && data.studentIds.length > 0) {
    for (const studentId of data.studentIds) {
      await linkStudentToProject(studentId, newRef.id);
    }
  }

  return newRef.id;
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  const docRef = doc(db, 'projects', projectId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? (snapshot.data() as Project) : null;
};

export const updateProject = async (projectId: string, data: Partial<Project>): Promise<void> => {
  const docRef = doc(db, 'projects', projectId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const archiveProject = async (projectId: string): Promise<void> => {
  await updateProject(projectId, { status: 'archived' });
};

interface ProjectFilters {
  status?: 'active' | 'archived';
  category?: string;
  academicYear?: string;
}

export const listProjects = async (filters?: ProjectFilters): Promise<Project[]> => {
  let q: any = collection(db, 'projects');
  
  if (filters) {
    if (filters.status) q = query(q, where('status', '==', filters.status));
    if (filters.category) q = query(q, where('category', '==', filters.category));
    if (filters.academicYear) q = query(q, where('academicYear', '==', filters.academicYear));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Project);
};

export const listProjectsByStudent = async (userId: string): Promise<Project[]> => {
  // Option 1: fetch user, get projectIds, fetch those projects
  // Option 2: array-contains query on projects collection
  const q = query(collection(db, 'projects'), where('studentIds', 'array-contains', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as Project);
};
