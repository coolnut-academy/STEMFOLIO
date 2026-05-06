import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Project, TimelineEvent, User, Advisor } from '@/types';

export interface PortfolioData {
  project: Project;
  students: User[];
  advisors: Advisor[];
  submissions: TimelineEvent[];
  highlights: TimelineEvent[];
}

export const getPortfolioData = async (projectId: string): Promise<PortfolioData> => {
  const projectRef = doc(db, 'projects', projectId);
  const projectSnap = await getDoc(projectRef);
  
  if (!projectSnap.exists()) {
    throw new Error('Project not found');
  }
  
  const project = projectSnap.data() as Project;

  // Get students
  const students: User[] = [];
  if (project.studentIds && project.studentIds.length > 0) {
    const studentsRef = collection(db, 'users');
    const studentsQ = query(studentsRef, where('id', 'in', project.studentIds.slice(0, 10))); // Assume max 10 for 'in'
    const studentsSnap = await getDocs(studentsQ);
    studentsSnap.forEach(doc => students.push(doc.data() as User));
  }

  // Get advisors
  const advisors: Advisor[] = [];
  if (project.advisorIds && project.advisorIds.length > 0) {
    const advisorsRef = collection(db, 'advisors');
    const advisorsQ = query(advisorsRef, where('id', 'in', project.advisorIds.slice(0, 10)));
    const advisorsSnap = await getDocs(advisorsQ);
    advisorsSnap.forEach(doc => advisors.push(doc.data() as Advisor));
  }

  // Get timeline events
  const timelineRef = collection(db, 'projects', projectId, 'timeline');
  const timelineQ = query(timelineRef, orderBy('createdAt', 'asc'));
  const timelineSnap = await getDocs(timelineQ);
  
  const allEvents = timelineSnap.docs.map(doc => doc.data() as TimelineEvent);
  
  const submissions = allEvents.filter(e => e.type === 'submission' || e.type === 'result');
  const highlights = allEvents.filter(e => e.isHighlight);

  return {
    project,
    students,
    advisors,
    submissions,
    highlights
  };
};
