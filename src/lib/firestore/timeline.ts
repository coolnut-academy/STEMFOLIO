import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, startAfter, serverTimestamp } from 'firebase/firestore';
import { TimelineEvent } from '@/types';
import { deleteImages } from '../storage';

const getTimelineCol = (projectId: string) => collection(db, 'projects', projectId, 'timeline');

export const createEvent = async (projectId: string, data: Omit<TimelineEvent, 'id' | 'createdAt' | 'updatedAt' | 'deleteRequested'>): Promise<string> => {
  const newRef = doc(getTimelineCol(projectId));
  const event: TimelineEvent = {
    ...data,
    id: newRef.id,
    deleteRequested: false,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };
  await setDoc(newRef, event);
  return newRef.id;
};

export const updateEvent = async (projectId: string, eventId: string, data: Partial<TimelineEvent>): Promise<void> => {
  const docRef = doc(getTimelineCol(projectId), eventId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

export const deleteEvent = async (projectId: string, eventId: string): Promise<void> => {
  const docRef = doc(getTimelineCol(projectId), eventId);
  const snap = await getDoc(docRef);
  
  if (snap.exists()) {
    const data = snap.data() as TimelineEvent;
    if (data.attachments && data.attachments.length > 0) {
      const imageUrls = data.attachments.filter(a => a.type === 'image').map(a => a.url);
      if (imageUrls.length > 0) {
        await deleteImages(imageUrls);
      }
    }
  }
  
  await deleteDoc(docRef);
};

export interface TimelineFilters {
  type?: 'progress' | 'submission' | 'result';
  lastDoc?: any;
  limitCount?: number;
}

export const listEvents = async (projectId: string, filters?: TimelineFilters): Promise<TimelineEvent[]> => {
  let q: any = getTimelineCol(projectId);
  
  if (filters?.type) {
    q = query(q, where('type', '==', filters.type));
  }
  
  q = query(q, orderBy('createdAt', 'desc'));
  
  if (filters?.lastDoc) {
    q = query(q, startAfter(filters.lastDoc));
  }
  
  q = query(q, limit(filters?.limitCount || 50));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TimelineEvent);
};

export const requestDelete = async (projectId: string, eventId: string, reason: string, requestedBy: string): Promise<void> => {
  await updateEvent(projectId, eventId, {
    deleteRequested: true,
    deleteRequestedBy: requestedBy,
    deleteRequestedAt: serverTimestamp() as any,
    deleteRequestReason: reason
  });
};

export const approveDelete = async (projectId: string, eventId: string): Promise<void> => {
  await deleteEvent(projectId, eventId);
};

export const rejectDelete = async (projectId: string, eventId: string): Promise<void> => {
  await updateEvent(projectId, eventId, {
    deleteRequested: false,
    deleteRequestedBy: null as any,
    deleteRequestedAt: null as any,
    deleteRequestReason: null as any
  });
};

export const listSubmissionEvents = async (projectId: string): Promise<TimelineEvent[]> => {
  const q = query(getTimelineCol(projectId), where('type', '==', 'submission'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data() as TimelineEvent);
};
