import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  nickname?: string;
  role: 'admin' | 'student';
  profileImageUrl?: string;
  studentId?: string;
  classRoom?: string;
  phone?: string;
  projectIds: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Advisor {
  id: string;
  name: string;
  title?: string;
  department?: string;
  phone?: string;
  email?: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Project {
  id: string;
  title: string;
  titleEn?: string;
  category: string;
  advisorIds: string[];
  studentIds: string[];
  status: 'active' | 'archived';
  coverImageUrl?: string;
  description?: string;
  academicYear: string;            // ← เพิ่มจาก V3 fix: e.g. "2569"
  isPublic: boolean;                // ← เพิ่มจาก V3 fix: portfolio share
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  timelineEventCount?: number;
}

export interface Attachment {
  id: string;
  url: string;
  type: 'image' | 'link' | 'video';
  name: string;
  thumbnailUrl?: string;
}

export interface TimelineEvent {
  id: string;
  type: 'progress' | 'submission' | 'result';
  title: string;
  description: string;
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isHighlight: boolean;
  attachments: Attachment[];

  // submission fields
  competitionName?: string;
  deadline?: Timestamp | null;
  submittedDate?: Timestamp | null;
  submissionStatus?: 'draft' | 'submitted';

  // result fields (linked to submission)
  linkedSubmissionId?: string;      // ← เพิ่มจาก V3 fix
  result?: 'pending' | 'pass' | 'fail' | 'award';
  announcementDate?: Timestamp | null;
  announcementUrl?: string;

  // delete request
  deleteRequested: boolean;
  deleteRequestedBy?: string;
  deleteRequestedAt?: Timestamp | null;
  deleteRequestReason?: string;
}

export interface InviteCode {
  code: string;
  projectId: string;
  createdBy: string;
  createdAt: Timestamp;
  maxUses: number;                  // ← เพิ่มจาก V3 fix: multi-use code
  usedCount: number;
  usedBy: string[];
}
