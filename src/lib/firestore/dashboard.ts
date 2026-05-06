import { db } from '../firebase';
import { collection, query, where, getDocs, collectionGroup, orderBy, limit, Timestamp } from 'firebase/firestore';
import { TimelineEvent, Project, User } from '@/types';

export interface DashboardFilters {
  dateRange?: { start: Date; end: Date };
  category?: string;
  status?: string;
  academicYear?: string;
}

export interface DashboardStats {
  totalProjects: number;
  totalSubmissions: number;
  pendingResults: number;
  passedOrAwarded: number;
  missedDeadlines: number;
  pendingDeletes: number;
}

export const getStats = async (filters?: DashboardFilters): Promise<DashboardStats> => {
  let projectQ: any = collection(db, 'projects');
  if (filters?.status) projectQ = query(projectQ, where('status', '==', filters.status));
  if (filters?.category) projectQ = query(projectQ, where('category', '==', filters.category));
  if (filters?.academicYear) projectQ = query(projectQ, where('academicYear', '==', filters.academicYear));

  const projectsSnap = await getDocs(projectQ);
  const projects = projectsSnap.docs.map(doc => doc.data() as Project);
  const projectIds = projects.map(p => p.id);

  let totalSubmissions = 0;
  let pendingResults = 0;
  let passedOrAwarded = 0;
  let missedDeadlines = 0;
  let pendingDeletes = 0;

  if (projectIds.length === 0) {
    return {
      totalProjects: 0,
      totalSubmissions,
      pendingResults,
      passedOrAwarded,
      missedDeadlines,
      pendingDeletes
    };
  }

  const now = new Date();

  // To make it robust, we'll iterate through projects and fetch their timelines.
  // This satisfies the filters on projects.
  for (const project of projects) {
    const q = collection(db, 'projects', project.id, 'timeline');
    const snap = await getDocs(q);
    const projEvents = snap.docs.map(doc => doc.data() as TimelineEvent);

    projEvents.forEach(event => {
      // Apply dateRange filter
      if (filters?.dateRange && event.createdAt) {
        const eventDate = event.createdAt.toDate();
        if (eventDate < filters.dateRange.start || eventDate > filters.dateRange.end) {
          return;
        }
      }

      if (event.type === 'submission') totalSubmissions++;
      if (event.type === 'result') {
        if (event.result === 'pending') pendingResults++;
        if (event.result === 'pass' || event.result === 'award') passedOrAwarded++;
      }
      if (event.type === 'submission' && event.deadline) {
        if (event.deadline.toDate() < now && event.submissionStatus === 'draft') {
          missedDeadlines++;
        }
      }
      if (event.deleteRequested) pendingDeletes++;
    });
  }

  return {
    totalProjects: projects.length,
    totalSubmissions,
    pendingResults,
    passedOrAwarded,
    missedDeadlines,
    pendingDeletes
  };
};

export const getEventsByMonth = async (filters?: DashboardFilters): Promise<{ month: string, count: number }[]> => {
  // Simplified for prototype: returning mock data.
  // Real implementation would group the fetched events by month.
  return [
    { month: 'ม.ค.', count: 12 },
    { month: 'ก.พ.', count: 19 },
    { month: 'มี.ค.', count: 15 },
    { month: 'เม.ย.', count: 22 },
    { month: 'พ.ค.', count: 30 },
  ];
};

export const getResultDistribution = async (filters?: DashboardFilters): Promise<{ result: string, count: number }[]> => {
  return [
    { result: 'ผ่าน', count: 45 },
    { result: 'ไม่ผ่าน', count: 12 },
    { result: 'รางวัล', count: 18 },
    { result: 'รอผล', count: 25 },
  ];
};

export const getCategoryDistribution = async (): Promise<{ category: string, count: number }[]> => {
  const q = collection(db, 'projects');
  const snap = await getDocs(q);
  const counts: Record<string, number> = {};
  snap.docs.forEach(doc => {
    const data = doc.data() as Project;
    counts[data.category] = (counts[data.category] || 0) + 1;
  });

  return Object.keys(counts).map(k => ({ category: k, count: counts[k] }));
};

export const getUpcomingDeadlines = async (): Promise<{event: TimelineEvent, projectTitle: string, projectId: string}[]> => {
  const result: {event: TimelineEvent, projectTitle: string, projectId: string}[] = [];
  const now = new Date();
  
  const projectsSnap = await getDocs(collection(db, 'projects'));
  for (const pdoc of projectsSnap.docs) {
    const project = pdoc.data() as Project;
    const q = query(collection(db, 'projects', project.id, 'timeline'), where('type', '==', 'submission'));
    const eventsSnap = await getDocs(q);
    
    eventsSnap.docs.forEach(edoc => {
      const event = edoc.data() as TimelineEvent;
      if (event.deadline && event.deadline.toDate() > now) {
        result.push({ event, projectTitle: project.title, projectId: project.id });
      }
    });
  }
  
  result.sort((a, b) => a.event.deadline!.toMillis() - b.event.deadline!.toMillis());
  return result;
};

export const getRecentActivity = async (limitCount: number = 20): Promise<{event: TimelineEvent, projectId: string}[]> => {
  const q = query(collectionGroup(db, 'timeline'), orderBy('createdAt', 'desc'), limit(limitCount));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({
    event: doc.data() as TimelineEvent,
    projectId: doc.ref.parent.parent!.id
  }));
};

export const getPendingDeleteRequests = async (): Promise<{ event: TimelineEvent, project: Project }[]> => {
  const result: { event: TimelineEvent, project: Project }[] = [];
  const projectsSnap = await getDocs(collection(db, 'projects'));
  
  for (const pdoc of projectsSnap.docs) {
    const project = pdoc.data() as Project;
    const q = query(collection(db, 'projects', project.id, 'timeline'), where('deleteRequested', '==', true));
    const eventsSnap = await getDocs(q);
    
    eventsSnap.docs.forEach(edoc => {
      result.push({ event: edoc.data() as TimelineEvent, project });
    });
  }
  return result;
};

export const getPendingUsers = async (): Promise<User[]> => {
  const q = query(collection(db, 'users'), where('status', '==', 'pending'));
  const snap = await getDocs(q);
  return snap.docs.map(doc => doc.data() as User);
};
