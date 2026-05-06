# STEMFOLIO — Development Plan

> แผนพัฒนาระบบ STEMFOLIO (STEM Project Lifecycle & Student Portfolio System)
> ออกแบบให้ AI อ่านแล้วเข้าใจครบถ้วน สามารถ implement ได้ทีละ phase โดยไม่ตกหล่น feature

---

## 📌 Quick Reference

| Item              | Value                                              |
| ----------------- | -------------------------------------------------- |
| ชื่อโปรเจค        | STEMFOLIO                                          |
| Tech Stack        | Next.js 15 (App Router) + Tailwind CSS + Firebase (Auth, Firestore, Storage) + Vercel |
| Repo              | GitHub                                             |
| Design Direction  | Liquid Glass (iOS-inspired, glassmorphism)          |
| Spec Document     | `coolnut-stem-spec-v3.md` (อ่านประกอบตลอด)         |
| Phase ทั้งหมด      | 6 Phases + Phase 0 (Setup)                         |

---

## 🏗️ Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    STEMFOLIO Architecture                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Browser (Next.js App)                                   │
│  ├── Pages (App Router)                                  │
│  │   ├── (auth)/login, join                              │
│  │   ├── (dashboard)/admin/*, student/*                  │
│  │   └── project/[id]/*, project/[id]/preview            │
│  ├── Components (ui/, timeline/, dashboard/, users/, etc)│
│  ├── Hooks (useAuth, useProject, useTimeline, etc)       │
│  ├── Lib (firebase, auth, firestore, storage, compress)  │
│  └── Types (TypeScript interfaces)                       │
│         │                                                │
│         ▼                                                │
│  Firebase Services                                       │
│  ├── Auth (email/password + custom claims)                │
│  ├── Firestore (users, advisors, projects, timeline,     │
│  │              inviteCodes, settings)                    │
│  ├── Storage (project images, profile images)            │
│  └── Cloud Functions (setAdminRole, validateInviteCode)  │
│         │                                                │
│         ▼                                                │
│  Hosting: Vercel (auto-deploy from GitHub main branch)   │
└──────────────────────────────────────────────────────────┘
```

---

## 📂 Final Project Structure (ปลายทาง — ทุก Phase รวมกัน)

> ⚠️ ทุก Phase จะสร้างไฟล์เฉพาะส่วนของตัวเอง ดูว่า Phase ไหนสร้างไฟล์ไหนได้ในแต่ละ Phase

```
stemfolio/
├── .env.local                          ← Firebase config (ห้าม commit)
├── .env.example                        ← ตัวอย่าง env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── firebase.json                       ← Firestore rules, Storage rules, indexes
├── firestore.rules
├── storage.rules
├── firestore.indexes.json
│
├── functions/                          ← Firebase Cloud Functions
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       └── index.ts                    ← setAdminRole, validateInviteCode
│
└── src/
    ├── app/
    │   ├── layout.tsx                  ← Root layout + AuthProvider + font + background
    │   ├── page.tsx                    ← Landing / redirect to dashboard
    │   ├── globals.css                 ← Tailwind + CSS variables (glass tokens)
    │   │
    │   ├── (auth)/
    │   │   ├── login/page.tsx          ← Admin & Student login
    │   │   └── join/page.tsx           ← Student join via invite code
    │   │
    │   ├── (dashboard)/
    │   │   ├── layout.tsx              ← Dashboard layout (sidebar/nav + auth guard)
    │   │   ├── admin/
    │   │   │   ├── page.tsx            ← Admin dashboard (stats + filter + charts)
    │   │   │   ├── students/page.tsx   ← Student CRUD table
    │   │   │   ├── advisors/page.tsx   ← Advisor CRUD table
    │   │   │   └── projects/
    │   │   │       ├── page.tsx        ← Project list (admin view)
    │   │   │       └── new/page.tsx    ← Create project form
    │   │   │
    │   │   └── student/
    │   │       └── page.tsx            ← Student dashboard (my projects + activity)
    │   │
    │   └── project/
    │       └── [id]/
    │           ├── page.tsx            ← Project detail + timeline + post composer
    │           ├── edit/page.tsx       ← Edit project (admin only)
    │           └── preview/page.tsx    ← Portfolio preview (public shareable)
    │
    ├── components/
    │   ├── ui/                         ← Reusable glass UI components
    │   │   ├── GlassCard.tsx
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── TextArea.tsx
    │   │   ├── Select.tsx
    │   │   ├── Badge.tsx
    │   │   ├── Modal.tsx
    │   │   ├── DatePicker.tsx          ← with "ยังไม่ทราบ" toggle
    │   │   ├── Spinner.tsx
    │   │   ├── EmptyState.tsx
    │   │   ├── ConfirmDialog.tsx
    │   │   ├── Toast.tsx
    │   │   └── ImageLightbox.tsx
    │   │
    │   ├── layout/
    │   │   ├── Sidebar.tsx             ← Desktop sidebar nav
    │   │   ├── BottomNav.tsx           ← Mobile bottom nav
    │   │   ├── TopBar.tsx              ← Header with user menu
    │   │   └── AuthGuard.tsx           ← Route protection by role
    │   │
    │   ├── timeline/
    │   │   ├── TimelineView.tsx        ← Timeline container + filter bar
    │   │   ├── TimelineCard.tsx        ← Single event card (progress/submission/result)
    │   │   ├── PostComposer.tsx        ← Create new post (Padlet-like)
    │   │   ├── ImageUploader.tsx       ← Multi-image picker + drag&drop + progress
    │   │   ├── ImageGrid.tsx           ← Masonry grid for attachments
    │   │   ├── LinkAttachment.tsx      ← URL + label input
    │   │   ├── SubmissionForm.tsx      ← Admin: create submission event
    │   │   ├── ResultForm.tsx          ← Admin: create result event (linked to submission)
    │   │   ├── DeleteRequestBadge.tsx  ← Orange "รอลบ" pill
    │   │   └── EditEventModal.tsx      ← Edit existing event
    │   │
    │   ├── dashboard/
    │   │   ├── StatsCard.tsx
    │   │   ├── FilterBar.tsx           ← Date range + category + status filters
    │   │   ├── DeadlineTracker.tsx
    │   │   ├── ActivityFeed.tsx
    │   │   ├── DeleteRequestQueue.tsx
    │   │   ├── EventBarChart.tsx       ← Recharts: events per month
    │   │   ├── ResultDonutChart.tsx    ← Recharts: pass/fail/award
    │   │   └── CategoryPieChart.tsx    ← Recharts: projects by category
    │   │
    │   ├── users/
    │   │   ├── StudentTable.tsx
    │   │   ├── AdvisorTable.tsx
    │   │   ├── StudentForm.tsx         ← Add/edit student modal
    │   │   └── AdvisorForm.tsx         ← Add/edit advisor modal
    │   │
    │   ├── project/
    │   │   ├── ProjectForm.tsx         ← Create/edit project
    │   │   ├── ProjectCard.tsx         ← Project list item
    │   │   ├── AdvisorPicker.tsx       ← Autocomplete + inline add
    │   │   ├── StudentPicker.tsx       ← Autocomplete + inline add
    │   │   └── InviteCodeGenerator.tsx ← Generate + display + copy
    │   │
    │   └── portfolio/
    │       ├── PortfolioHeader.tsx
    │       ├── PortfolioSummary.tsx
    │       └── PortfolioTimeline.tsx
    │
    ├── lib/
    │   ├── firebase.ts                 ← Firebase app init + getAuth + getFirestore + getStorage
    │   ├── auth.ts                     ← signIn, signUp, signOut, onAuthChange, getRole
    │   ├── firestore/
    │   │   ├── users.ts                ← CRUD: getUser, updateUser, listStudents, etc.
    │   │   ├── advisors.ts             ← CRUD: createAdvisor, updateAdvisor, listAdvisors, deleteAdvisor
    │   │   ├── projects.ts             ← CRUD: createProject, updateProject, listProjects, archiveProject
    │   │   ├── timeline.ts             ← CRUD: createEvent, updateEvent, deleteEvent, listEvents, etc.
    │   │   ├── inviteCodes.ts          ← generateCode, validateCode, redeemCode
    │   │   ├── settings.ts             ← getCategories, updateCategories
    │   │   └── dashboard.ts            ← getStats, getDeadlines, getActivityFeed, getDeleteRequests
    │   ├── storage.ts                  ← uploadImage, deleteImage, getDownloadURL
    │   ├── compress.ts                 ← compressForUpload (A4 max, client-side)
    │   └── utils.ts                    ← relativeTime, formatDate, generateId, etc.
    │
    ├── hooks/
    │   ├── useAuth.ts                  ← AuthContext + useAuth hook
    │   ├── useProject.ts
    │   ├── useTimeline.ts              ← list + create + update + delete events
    │   ├── useStudents.ts
    │   ├── useAdvisors.ts
    │   ├── useImageUpload.ts           ← compress + parallel upload + progress state
    │   ├── useDeleteRequest.ts
    │   ├── useDashboardStats.ts
    │   └── useCategories.ts
    │
    └── types/
        └── index.ts                    ← User, Advisor, Project, TimelineEvent, Attachment, etc.
```

---

# ═══════════════════════════════════════════
# PHASE 0 — Project Setup & Firebase Config
# ═══════════════════════════════════════════

## 🎯 เป้าหมาย
สร้างโปรเจค Next.js เปล่า, ตั้งค่า Firebase, deploy ได้บน Vercel, push ขึ้น GitHub

## 📋 Checklist — ทำให้ครบทุกข้อ

### 0.1 สร้าง Next.js Project
- [ ] `npx create-next-app@latest stemfolio --typescript --tailwind --app --src-dir --use-npm`
- [ ] ลบ boilerplate ทิ้ง (default page content, default CSS)
- [ ] ตั้ง path alias `@/` → `src/` ใน `tsconfig.json`

### 0.2 Install Dependencies
```bash
npm install firebase browser-image-compression recharts lucide-react
npm install -D @types/node
```

### 0.3 สร้าง Firebase Project
- [ ] ไปที่ Firebase Console → สร้าง project "stemfolio"
- [ ] เปิด Authentication → enable Email/Password provider
- [ ] สร้าง Firestore database (production mode)
- [ ] เปิด Firebase Storage
- [ ] เปิด Cloud Functions (Blaze plan required)

### 0.4 Environment Variables
- [ ] สร้าง `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
```
- [ ] สร้าง `.env.example` (เหมือนกันแต่ค่าว่าง)
- [ ] เพิ่ม `.env.local` ใน `.gitignore`

### 0.5 Firebase Init Files

- [ ] สร้าง `src/lib/firebase.ts`:
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence (call once)
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch(console.error);
}
```

### 0.6 TypeScript Types
- [ ] สร้าง `src/types/index.ts` ที่มีทุก interface ตาม spec:
```typescript
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
```

### 0.7 Tailwind CSS Variables (Liquid Glass)
- [ ] สร้าง `src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --glass-bg: rgba(255, 255, 255, 0.45);
  --glass-bg-hover: rgba(255, 255, 255, 0.6);
  --glass-border: rgba(255, 255, 255, 0.3);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  --glass-blur: blur(20px) saturate(180%);
  --accent-blue: #007AFF;
  --accent-green: #34C759;
  --accent-red: #FF3B30;
  --accent-yellow: #FFCC00;
  --accent-purple: #AF52DE;
  --accent-orange: #FF9500;
  --radius-card: 20px;
  --radius-button: 14px;
  --radius-input: 12px;
  --radius-pill: 999px;
}

body {
  font-family: "Inter", system-ui, sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 50%, #d5dce6 100%);
  min-height: 100vh;
}
```

### 0.8 Firestore Security Rules
- [ ] สร้าง `firestore.rules` (คัดลอกจาก spec section 13 + เพิ่ม settings collection + storage rules)

### 0.9 Storage Security Rules
- [ ] สร้าง `storage.rules`:
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /projects/{projectId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
    match /profiles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null
        && request.auth.uid == userId
        && request.resource.size < 2 * 1024 * 1024
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 0.10 Firestore Indexes
- [ ] สร้าง `firestore.indexes.json` ตาม spec section 14

### 0.11 Cloud Functions Scaffold
- [ ] `cd functions && npm init && npm install firebase-functions firebase-admin typescript`
- [ ] สร้าง `functions/src/index.ts` (scaffold เปล่าก่อน — implement ใน Phase 1)

### 0.12 GitHub + Vercel
- [ ] `git init && git remote add origin ...`
- [ ] push ขึ้น GitHub
- [ ] connect Vercel → auto-deploy from `main`
- [ ] ตั้ง env vars ใน Vercel dashboard

---

## ✅ CHECKPOINT 0 — ต้องผ่านทั้งหมดก่อนไป Phase 1

| # | Check | Pass? |
|---|-------|-------|
| 1 | `npm run dev` รันได้ไม่ error | ☐ |
| 2 | `npm run build` สำเร็จ | ☐ |
| 3 | เปิด `localhost:3000` เห็นหน้าเปล่า + gradient background | ☐ |
| 4 | `src/lib/firebase.ts` import ได้ไม่ error | ☐ |
| 5 | `src/types/index.ts` compile ผ่าน (no TS error) | ☐ |
| 6 | Firebase Console: Auth, Firestore, Storage เปิดแล้ว | ☐ |
| 7 | `.env.local` มีค่าครบ + ไม่อยู่ใน git | ☐ |
| 8 | Deploy บน Vercel สำเร็จ (หน้าเปล่าก็ได้) | ☐ |
| 9 | `firestore.rules` + `storage.rules` deploy แล้ว | ☐ |
| 10 | `functions/` folder มี scaffold | ☐ |

---

# ═══════════════════════════════════════════
# PHASE 1 — Auth + UI Foundation
# ═══════════════════════════════════════════

## 🎯 เป้าหมาย
ระบบ auth ทำงานได้ (login, signup, role-based redirect), UI components พื้นฐานพร้อมใช้, layout + navigation ครบ

## 📌 Phase 0 ทำอะไรไปแล้ว
- Next.js project + Firebase config + Types + Tailwind CSS variables + Security rules + Vercel deploy

## 📋 Checklist — ทำให้ครบทุกข้อ

### 1.1 Cloud Function: setAdminRole
- [ ] สร้างใน `functions/src/index.ts`:
  - HTTP callable function `setAdminRole`
  - รับ `{ email: string }`
  - ตั้ง custom claim `{ role: "admin" }` ให้ user ที่มี email นั้น
  - ⚠️ ป้องกัน: เฉพาะ admin ที่เรียกได้ (หรือ hardcode admin email แรก)
- [ ] Deploy: `firebase deploy --only functions`

### 1.2 Auth Library (`src/lib/auth.ts`)
- [ ] `signInWithEmail(email, password)` → return user
- [ ] `signUpWithEmail(email, password, name)` → create auth + user doc ใน Firestore
- [ ] `signOut()`
- [ ] `onAuthStateChange(callback)` → listen auth + fetch user doc + get role from custom claims
- [ ] `getIdTokenResult()` → ดึง custom claims (role)

### 1.3 Auth Context & Hook (`src/hooks/useAuth.ts`)
- [ ] `AuthProvider` component (wrap ใน root layout)
- [ ] `useAuth()` hook returns: `{ user, userDoc, role, loading, signIn, signUp, signOut }`
- [ ] `role` ดึงจาก `idTokenResult.claims.role` (ไม่ใช่จาก Firestore doc — ป้องกัน student แก้ role)

### 1.4 Auth Pages

**Login Page (`src/app/(auth)/login/page.tsx`):**
- [ ] Glass card centered บนหน้า
- [ ] Form: email, password, [เข้าสู่ระบบ] button
- [ ] error handling: wrong password, user not found
- [ ] หลัง login สำเร็จ → redirect ตาม role:
  - admin → `/admin`
  - student → `/student`
- [ ] link ไป `/join` สำหรับนักเรียน

**Join Page (`src/app/(auth)/join/page.tsx`):**
- [ ] Step 1: ใส่ invite code → validate (check Firestore: exists + ยังไม่ใช้ครบ)
- [ ] Step 2 (code valid): แสดงชื่อ project + form สร้าง account (email, password, ชื่อ, ชื่อเล่น)
- [ ] Step 2 alt (user login อยู่แล้ว): แสดงชื่อ project + ปุ่ม [เข้าร่วม] เลย ← V3 fix
- [ ] หลัง join: update invite code (usedCount++, usedBy[]) + เพิ่ม studentIds ใน project + เพิ่ม projectIds ใน user
- [ ] redirect → `/student`

### 1.5 UI Components (Glass Design System)

สร้างทุกตัวใน `src/components/ui/` — ทุกตัวต้องรองรับ Liquid Glass style:

- [ ] **GlassCard.tsx** — `backdrop-filter: blur(20px) saturate(180%)`, `bg: rgba(255,255,255,0.45)`, `border: 1px solid rgba(255,255,255,0.3)`, `border-radius: 20px`, `box-shadow: 0 8px 32px rgba(0,0,0,0.08)`, hover state
- [ ] **Button.tsx** — variants: `primary` (accent-blue), `secondary` (glass), `danger` (accent-red), `ghost` (transparent) | sizes: `sm`, `md`, `lg` | loading state with spinner
- [ ] **Input.tsx** — glass background, rounded-12px, focus ring accent-blue, label + error message support
- [ ] **TextArea.tsx** — เหมือน Input แต่ multi-line, auto-grow
- [ ] **Select.tsx** — dropdown with glass styling
- [ ] **Badge.tsx** — pill shape (`border-radius: 999px`), variants: `blue`, `green`, `red`, `yellow`, `purple`, `orange`, `gray`
- [ ] **Modal.tsx** — glass overlay + centered card + close button + animation (fade-in + scale)
- [ ] **DatePicker.tsx** — date input + checkbox "ยังไม่ทราบวันที่" → returns `Date | null` ← V3 fix
- [ ] **Spinner.tsx** — loading spinner (animated)
- [ ] **EmptyState.tsx** — icon + message + optional action button
- [ ] **ConfirmDialog.tsx** — Modal wrapper สำหรับ confirm/cancel
- [ ] **Toast.tsx** — slide-in notification (success, error, info)
- [ ] **ImageLightbox.tsx** — full-screen image viewer, swipe/arrow navigation

### 1.6 Layout Components

- [ ] **Sidebar.tsx** — desktop only (hidden on mobile), glass background, nav links ตาม role:
  - Admin: Dashboard, นักเรียน, ครูที่ปรึกษา, โครงงาน
  - Student: โครงงานของฉัน
  - Active state highlight
- [ ] **BottomNav.tsx** — mobile only, glass background, icon + label, same nav items as sidebar
- [ ] **TopBar.tsx** — ชื่อหน้า + user avatar + dropdown (profile, logout)
- [ ] **AuthGuard.tsx** — component ที่ wrap route:
  - ถ้าไม่ login → redirect `/login`
  - ถ้า role ไม่ตรง (student เข้า admin page) → redirect ไปหน้าของ role ตัวเอง
  - ระหว่าง loading → แสดง Spinner

### 1.7 Dashboard Layout
- [ ] `src/app/(dashboard)/layout.tsx`:
  - Wrap ด้วย AuthGuard
  - Desktop: Sidebar ซ้าย + content ขวา
  - Mobile: content full width + BottomNav ล่าง
  - TopBar ด้านบนเสมอ

### 1.8 Settings Collection (Categories)
- [ ] สร้าง Firestore doc `settings/categories`:
```
{
  items: ["ฟิสิกส์", "เคมี", "ชีววิทยา", "คณิตศาสตร์", "คอมพิวเตอร์", "วิศวกรรม", "สิ่งแวดล้อม"]
}
```
- [ ] สร้าง `src/lib/firestore/settings.ts`: `getCategories()`, `updateCategories(items[])`
- [ ] Firestore rule: anyone auth can read, only admin can write

---

## ✅ CHECKPOINT 1 — ต้องผ่านทั้งหมดก่อนไป Phase 2

| # | Check | Pass? |
|---|-------|-------|
| 1 | เข้า `/login` → เห็น glass card login form | ☐ |
| 2 | สร้าง admin account → login → redirect ไป `/admin` | ☐ |
| 3 | เรียก setAdminRole Cloud Function → user ได้ role admin | ☐ |
| 4 | Admin login → เห็น Sidebar (Desktop) หรือ BottomNav (Mobile) | ☐ |
| 5 | Student (ไม่มี admin claim) login → redirect ไป `/student` | ☐ |
| 6 | Student เข้า `/admin` → ถูก redirect กลับ `/student` | ☐ |
| 7 | ไม่ login เข้า `/admin` → redirect ไป `/login` | ☐ |
| 8 | เข้า `/join` → ใส่ invite code (hardcode ไว้ใน Firestore ก่อน) → สร้าง account → join project | ☐ |
| 9 | User ที่ login อยู่แล้ว เข้า `/join` → ใส่ code → join ได้โดยไม่ต้องสร้าง account ใหม่ | ☐ |
| 10 | ทุก UI component render ถูกต้อง: GlassCard, Button (4 variants), Input, Modal, Badge (7 colors), DatePicker (with null toggle), Toast | ☐ |
| 11 | Responsive: Desktop = sidebar, Mobile = bottom nav | ☐ |
| 12 | `npm run build` สำเร็จ ไม่มี TS error | ☐ |

---

# ═══════════════════════════════════════════
# PHASE 2 — User Management + Project CRUD
# ═══════════════════════════════════════════

## 🎯 เป้าหมาย
Admin จัดการนักเรียน + ครูที่ปรึกษาได้ครบ (CRUD), สร้าง/แก้ไข/archive project ได้, invite code ใช้งานได้จริง

## 📌 Phase ก่อนหน้าทำอะไรไปแล้ว
- Phase 0: Project setup, Firebase config, Types, CSS variables
- Phase 1: Auth (login/join/role-based redirect), UI components ทั้งหมด, Layout (sidebar/bottomnav/topbar), AuthGuard, Settings (categories)

## 📋 Checklist — ทำให้ครบทุกข้อ

### 2.1 Firestore CRUD: Users (`src/lib/firestore/users.ts`)
- [ ] `getUser(userId)` → User
- [ ] `updateUser(userId, data)` → void
- [ ] `listStudents()` → User[] (where role == student)
- [ ] `searchStudents(query)` → User[] (search by name or studentId)
- [ ] `deleteStudent(userId)` → soft delete: ลบออกจาก project.studentIds + ลบ projectIds ใน user doc (ไม่ลบ auth account)
- [ ] `linkStudentToProject(userId, projectId)` → update ทั้ง user.projectIds + project.studentIds
- [ ] `unlinkStudentFromProject(userId, projectId)` → reverse

### 2.2 Firestore CRUD: Advisors (`src/lib/firestore/advisors.ts`)
- [ ] `createAdvisor(data)` → advisorId
- [ ] `getAdvisor(advisorId)` → Advisor
- [ ] `updateAdvisor(advisorId, data)` → void
- [ ] `listAdvisors()` → Advisor[]
- [ ] `deleteAdvisor(advisorId)` → check ว่าไม่มี project อ้างอิง → ถ้ามี → throw error / return warning
- [ ] `searchAdvisors(query)` → Advisor[] (search by name)

### 2.3 Firestore CRUD: Projects (`src/lib/firestore/projects.ts`)
- [ ] `createProject(data)` → projectId (ต้อง update studentIds ของ user ที่ถูกเพิ่มด้วย)
- [ ] `getProject(projectId)` → Project
- [ ] `updateProject(projectId, data)` → void
- [ ] `archiveProject(projectId)` → set status = "archived"
- [ ] `listProjects(filters?)` → Project[] (filter by status, category, academicYear)
- [ ] `listProjectsByStudent(userId)` → Project[] (ดึงจาก user.projectIds)

### 2.4 Invite Code System (`src/lib/firestore/inviteCodes.ts`)
- [ ] `generateInviteCode(projectId, maxUses)` → code string (random 6 ตัวพิมพ์ใหญ่) ← V3 fix: multi-use
- [ ] `validateCode(code)` → { valid: boolean, project?: Project, remaining?: number }
- [ ] `redeemCode(code, userId)` → update usedCount + usedBy[] + link student to project
- [ ] ถ้า `usedCount >= maxUses` → code expired

### 2.5 Hooks
- [ ] `useStudents()` → { students, loading, search, refresh }
- [ ] `useAdvisors()` → { advisors, loading, search, refresh }
- [ ] `useProject(projectId?)` → { project, loading, refresh }

### 2.6 Student Management Page (`/admin/students`)
- [ ] **StudentTable.tsx:**
  - ตาราง glass card: ชื่อ, เลขประจำตัว, ห้อง, โครงงานที่เข้าร่วม (chips)
  - search bar ด้านบน (filter by ชื่อ / เลขประจำตัว)
  - click row → เปิด StudentForm modal
  - ปุ่ม [+ เพิ่มนักเรียน] ด้านบนขวา
- [ ] **StudentForm.tsx (Modal):**
  - fields: ชื่อ-นามสกุล*, ชื่อเล่น, เลขประจำตัว, ห้องเรียน, เบอร์โทร
  - mode: create / edit (auto-detect)
  - ปุ่ม [บันทึก] + [ยกเลิก]
  - ถ้า edit → แสดงปุ่ม [ลบออกจากระบบ] (with ConfirmDialog)

### 2.7 Advisor Management Page (`/admin/advisors`)
- [ ] **AdvisorTable.tsx:**
  - ตาราง glass card: คำนำหน้า + ชื่อ, สังกัด, email, โครงงานที่เป็นที่ปรึกษา
  - ปุ่ม [+ เพิ่มครูที่ปรึกษา]
  - click row → เปิด AdvisorForm modal
- [ ] **AdvisorForm.tsx (Modal):**
  - fields: คำนำหน้า, ชื่อ*, สังกัด/กลุ่มสาระ, เบอร์โทร, email
  - ปุ่ม [ลบ] → check project references → confirm

### 2.8 Project List Page (`/admin/projects`)
- [ ] **ProjectCard.tsx:**
  - glass card: ชื่อโครงงาน, category badge, จำนวนนักเรียน, จำนวน events, status badge
  - cover image (ถ้ามี)
  - click → navigate to `/project/[id]`
- [ ] Filter bar: status (active/archived), category, academicYear ← V3 fix
- [ ] ปุ่ม [+ สร้างโครงงานใหม่] → navigate to `/admin/projects/new`

### 2.9 Create Project Page (`/admin/projects/new`)
- [ ] **ProjectForm.tsx** — form เดียว 4 sections:
  - **➊ ข้อมูลโครงงาน:** ชื่อ TH*, ชื่อ EN, หมวดหมู่* (dropdown จาก categories), คำอธิบาย, ปีการศึกษา* (default ปีปัจจุบัน ← V3 fix), ภาพปก (upload 1 รูป)
  - **➋ ครูที่ปรึกษา:** AdvisorPicker (autocomplete + ปุ่ม "เพิ่มครูใหม่" → inline AdvisorForm modal)
  - **➌ นักเรียน:** StudentPicker (autocomplete + ปุ่ม "เพิ่มนักเรียนใหม่") + InviteCodeGenerator (ปุ่ม "สร้าง Invite Code" → แสดง code + copy button + ตั้ง maxUses)
  - **➍ Timeline เริ่มต้น (optional):** ปุ่ม [+ เพิ่ม submission] → inline form (ชื่อเวที, deadline (nullable DatePicker), วันประกาศผล (nullable DatePicker))
- [ ] กด [สร้างโครงงาน] → สร้าง project doc + link students + สร้าง initial timeline events (ถ้ามี)

### 2.10 Edit Project Page (`/project/[id]/edit`)
- [ ] เหมือน ProjectForm แต่ prefill data
- [ ] เพิ่มปุ่ม [Archive โครงงาน] (with ConfirmDialog)
- [ ] เพิ่ม toggle `isPublic` สำหรับ portfolio sharing ← V3 fix

### 2.11 Student Dashboard Page (`/student`)
- [ ] แสดง greeting: "สวัสดี, [ชื่อ]"
- [ ] แสดง project cards ของ student (จาก user.projectIds)
- [ ] click card → navigate to `/project/[id]`
- [ ] ถ้าไม่มี project → EmptyState "ยังไม่มีโครงงาน — ใส่ Invite Code เพื่อเข้าร่วม" + link ไป `/join`

---

## ✅ CHECKPOINT 2 — ต้องผ่านทั้งหมดก่อนไป Phase 3

| # | Check | Pass? |
|---|-------|-------|
| 1 | Admin เข้า `/admin/students` → เห็นตารางนักเรียน (เปล่าก็ได้ถ้ายังไม่มี) | ☐ |
| 2 | Admin กด [+ เพิ่มนักเรียน] → modal เปิด → กรอกข้อมูล → บันทึก → เห็นในตาราง | ☐ |
| 3 | Admin click row → modal edit → แก้ชื่อ → บันทึก → ตารางอัปเดต | ☐ |
| 4 | Admin ลบนักเรียน → confirm → หายจากตาราง | ☐ |
| 5 | Admin search นักเรียนด้วยชื่อ → filter ถูกต้อง | ☐ |
| 6 | เหมือนกันสำหรับ Advisor: เพิ่ม/แก้/ลบ/search | ☐ |
| 7 | Admin ลบ advisor ที่มี project อ้างอิง → แสดง warning | ☐ |
| 8 | Admin เข้า `/admin/projects/new` → เห็น form 4 sections | ☐ |
| 9 | เลือก advisor จาก autocomplete → แสดงเป็น chip ที่ลบได้ | ☐ |
| 10 | เลือก student จาก autocomplete → แสดงเป็น chip | ☐ |
| 11 | กด [สร้าง Invite Code] → แสดง code + copy button + ตั้ง maxUses | ☐ |
| 12 | กด [สร้างโครงงาน] → สร้างสำเร็จ → redirect ไป project list | ☐ |
| 13 | Project list: แสดง cards + filter by status/category/academicYear | ☐ |
| 14 | Click project card → ไปหน้า project detail (เนื้อหาเปล่าก็ได้ — Phase 3 จะทำ timeline) | ☐ |
| 15 | Student login → เห็น project ของตัวเอง | ☐ |
| 16 | Student ไม่เห็น project ของคนอื่น | ☐ |
| 17 | Invite code multi-use: student 2 คนใช้ code เดียวกัน join project เดียวกันได้ | ☐ |
| 18 | `npm run build` สำเร็จ ไม่มี TS error | ☐ |

---

# ═══════════════════════════════════════════
# PHASE 3 — Timeline & Padlet-like Posting
# ═══════════════════════════════════════════

## 🎯 เป้าหมาย
Timeline ทำงานได้ครบ: โพสต์ (text + multi-image + link + video link), แก้ไข, ขอลบ, submission/result events, flexible dates, image compression + parallel upload

## 📌 Phase ก่อนหน้าทำอะไรไปแล้ว
- Phase 0: Setup
- Phase 1: Auth + UI components + Layout
- Phase 2: User CRUD (students, advisors) + Project CRUD + Invite code + Student dashboard

## 📋 Checklist — ทำให้ครบทุกข้อ

### 3.1 Image Compression (`src/lib/compress.ts`)
- [ ] `compressForUpload(file: File): Promise<File>`
  - ใช้ `browser-image-compression`
  - `maxWidthOrHeight: 1754` (A4 at 150 DPI)
  - `maxSizeMB: 2`
  - `initialQuality: 0.85`
  - `fileType: 'image/jpeg'`
  - `useWebWorker: true`
  - ถ้ารูปเล็กกว่า 1754px → ไม่ resize แต่ยัง compress quality (library จัดการให้)

### 3.2 Storage Helpers (`src/lib/storage.ts`)
- [ ] `uploadImage(projectId, eventId, file): Promise<{ url: string, name: string }>`
  - path: `projects/{projectId}/timeline/{eventId}/{uuid}.jpg`
  - return download URL
- [ ] `uploadImages(projectId, eventId, files[], onProgress): Promise<Attachment[]>`
  - compress ทุกไฟล์ก่อน
  - upload แบบ parallel (`Promise.allSettled`)
  - `onProgress(completed, total, failedIndexes)` callback
  - ถ้าบาง file fail → return สำเร็จ + list ของ failed files ← V3 fix
- [ ] `deleteImages(urls[])` → delete จาก Storage

### 3.3 Image Upload Hook (`src/hooks/useImageUpload.ts`)
- [ ] state: `{ files: File[], previews: string[], uploading: boolean, progress: { completed: number, total: number }, failedIndexes: number[] }`
- [ ] `addFiles(fileList)` → validate type + add to files + generate preview URLs
- [ ] `removeFile(index)` → remove from files + revoke preview URL
- [ ] `uploadAll(projectId, eventId)` → compress + upload + return Attachment[]
- [ ] `reset()` → clear all state
- [ ] max 20 files validation

### 3.4 Firestore CRUD: Timeline (`src/lib/firestore/timeline.ts`)
- [ ] `createEvent(projectId, data): Promise<eventId>`
- [ ] `updateEvent(projectId, eventId, data): Promise<void>`
- [ ] `deleteEvent(projectId, eventId): Promise<void>` + delete attachments from Storage
- [ ] `listEvents(projectId, filters?): Promise<TimelineEvent[]>`
  - pagination: `limit(50)`, `startAfter(lastDoc)`
  - sort by `createdAt DESC` (newest first — Padlet style)
  - optional filter by `type`
- [ ] `requestDelete(projectId, eventId, reason): Promise<void>` → set deleteRequested fields
- [ ] `approveDelete(projectId, eventId): Promise<void>` → delete event + attachments
- [ ] `rejectDelete(projectId, eventId): Promise<void>` → reset deleteRequested = false
- [ ] `listSubmissionEvents(projectId): Promise<TimelineEvent[]>` → สำหรับ ResultForm dropdown ← V3 fix

### 3.5 Timeline Hook (`src/hooks/useTimeline.ts`)
- [ ] `useTimeline(projectId)` → `{ events, loading, hasMore, loadMore, refresh, filterByType }`

### 3.6 Project Detail Page (`/project/[id]/page.tsx`)
- [ ] **Header section:**
  - ชื่อโครงงาน (TH + EN)
  - Category badge + Academic year badge
  - นักเรียน (avatars + names)
  - ครูที่ปรึกษา (names)
  - ปุ่ม [แก้ไข] (admin only) → navigate to edit page
  - ปุ่ม [Preview Portfolio] → navigate to preview page
- [ ] **Timeline filter bar:**
  - filter by type: ทั้งหมด | progress | submission | result ← V3 fix
  - search by keyword ← V3 fix
- [ ] **Post Composer (sticky top):**
  - ดู section 3.7
- [ ] **Timeline feed:**
  - TimelineCard list (newest first)
  - infinite scroll (load more เมื่อ scroll ถึงล่าง)
  - ถ้าเปล่า → EmptyState

### 3.7 PostComposer.tsx
- [ ] Collapsed state: glass card ที่แสดง "[💬 เขียนอะไรสักหน่อย...]" → click to expand
- [ ] Expanded state:
  - Input: หัวข้อ (required)
  - TextArea: รายละเอียด (optional, multi-line)
  - **Attachment bar:** 3 ปุ่ม icon:
    - [📎 รูปภาพ] → open ImageUploader
    - [🔗 Link] → open LinkAttachment inline form
    - [🎬 Video] → open video link input (URL only — YouTube/Drive)
  - แสดง preview ของ attachments ที่เพิ่มแล้ว
  - ปุ่ม [โพสต์] (disabled ถ้า title ว่าง)
- [ ] Submit flow:
  1. disable form
  2. compress images (show progress)
  3. upload images parallel (show progress)
  4. ถ้ามี failed uploads → ถาม user: "รูป X ตัว upload ไม่สำเร็จ — ข้ามหรือลองใหม่?" ← V3 fix
  5. save event doc (type = "progress", attachments = uploaded + links + videos)
  6. reset composer
  7. refresh timeline

### 3.8 ImageUploader.tsx
- [ ] `<input type="file" multiple accept="image/jpeg,image/png,image/webp">`
- [ ] Drag & drop zone
- [ ] Preview grid: thumbnails with [✕] remove button
- [ ] Validation: max 20 files, show error ถ้าเกิน
- [ ] Progress bar: "กำลังบีบอัด... 3/5 (60%)" + "กำลังอัปโหลด... 4/5 (80%)"

### 3.9 LinkAttachment.tsx
- [ ] Inline form: URL input + Label input + [เพิ่ม] button
- [ ] แสดง list ของ links ที่เพิ่มแล้ว (with [✕] remove)
- [ ] URL validation (basic — starts with http)

### 3.10 TimelineCard.tsx
- [ ] Glass card + left border สีตาม type:
  - progress → `--accent-blue`
  - submission → `--accent-purple`
  - result/pass/award → `--accent-green` | result/fail → `--accent-red` | result/pending → `--accent-yellow`
- [ ] Header: type badge (pill) + relative time ("2 ชม. ที่แล้ว")
- [ ] Title (bold)
- [ ] Description (multi-line, plain text)
- [ ] **Attachments display:**
  - Images → ImageGrid (masonry-like, click → ImageLightbox)
  - Links → clickable chips
  - Videos → clickable chips (with 🎬 icon)
- [ ] Footer: "โดย: [ชื่อผู้โพสต์] [ห้อง]"
- [ ] **Action buttons (conditional):**
  - [แก้ไข] → แสดงถ้า: (admin) หรือ (owner + type==progress)
  - [ลบ] → แสดงถ้า: admin → ลบทันที (ConfirmDialog)
  - [ขอลบ] → แสดงถ้า: student + owner + type==progress → open delete request modal
- [ ] **Delete request badge:** ถ้า `deleteRequested == true` → แสดง orange pill "รอลบ"
- [ ] **Submission-specific fields:**
  - แสดง: ชื่อเวที, deadline (+ countdown badge ถ้ามี), สถานะ (draft/submitted)
  - ถ้า deadline == null → แสดง "ยังไม่กำหนด" + badge สีเทา
  - ถ้า announcementDate == null → แสดง "ยังไม่ทราบ" + ปุ่ม [+ เพิ่มวันที่] (admin only)
- [ ] **Result-specific fields:**
  - แสดง: ชื่อเวที (ดึงจาก linked submission ถ้ามี), ผลลัพธ์ badge (pass/fail/award/pending)
  - announcementUrl → clickable link
- [ ] **isHighlight toggle:** star icon (admin only) → click to toggle

### 3.11 SubmissionForm.tsx (Admin only)
- [ ] Modal ที่เปิดจากปุ่ม [+ เพิ่มการส่งแข่ง] (แสดงข้าง post composer สำหรับ admin)
- [ ] Fields: ชื่อเวที*, deadline (nullable DatePicker), วันที่ส่ง (nullable), สถานะ (draft/submitted), description (optional)
- [ ] Attachments: images, links (same as PostComposer)
- [ ] Save → create timeline event type = "submission"

### 3.12 ResultForm.tsx (Admin only)
- [ ] Modal ที่เปิดจากปุ่ม [+ เพิ่มผลลัพธ์]
- [ ] **Dropdown เลือก submission ที่จะอัปเดตผล** → ดึงจาก `listSubmissionEvents()` ← V3 fix
  - เลือกแล้ว → auto-fill ชื่อเวที
  - เก็บ `linkedSubmissionId` ใน event doc
- [ ] Fields: ผลลัพธ์* (pending/pass/fail/award), วันประกาศ (nullable), URL ประกาศผล, description
- [ ] Save → create timeline event type = "result"

### 3.13 EditEventModal.tsx
- [ ] Modal สำหรับแก้ไข event ที่มีอยู่
- [ ] Admin: แก้ได้ทุก field
- [ ] Student: แก้ได้เฉพาะ title, description, attachments ของ progress event ตัวเอง
- [ ] Flexible dates: เติม date ที่เป็น null ได้ ← V3 fix

### 3.14 DeleteRequestBadge.tsx + Delete Request Modal
- [ ] Badge: orange pill "รอลบ" บน TimelineCard
- [ ] Modal (เปิดเมื่อ student กดขอลบ): TextArea "เหตุผลที่ต้องการลบ" (optional) + [ส่งคำขอ] + [ยกเลิก]

---

## ✅ CHECKPOINT 3 — ต้องผ่านทั้งหมดก่อนไป Phase 4

| # | Check | Pass? |
|---|-------|-------|
| 1 | เข้า `/project/[id]` → เห็น header + timeline + post composer | ☐ |
| 2 | Student พิมพ์หัวข้อ + ข้อความ → กด [โพสต์] → เห็นใน timeline ทันที | ☐ |
| 3 | Student แนบรูป 3 รูป (รวม > 5MB) → compress → upload → เห็นรูปใน card | ☐ |
| 4 | Student แนบรูป 1 รูป ที่ใหญ่กว่า A4 → compress ลงมา ≤ 1754px | ☐ |
| 5 | Student แนบรูปเล็ก (800px) → ไม่ resize แต่ compress quality → size < 2MB | ☐ |
| 6 | Student แนบ 5 รูป → progress bar แสดงถูกต้อง → upload สำเร็จ | ☐ |
| 7 | Student แนบ link → แสดงเป็น clickable chip ใน card | ☐ |
| 8 | Student แนบ video link (YouTube URL) → แสดงเป็น 🎬 chip | ☐ |
| 9 | Click รูปใน card → ImageLightbox เปิด → swipe ดูรูปอื่นได้ | ☐ |
| 10 | Student กด [แก้ไข] บนโพสต์ตัวเอง → modal → แก้ title → บันทึก → อัปเดต | ☐ |
| 11 | Student กด [ขอลบ] → modal → ใส่เหตุผล → ส่ง → แสดง "รอลบ" badge | ☐ |
| 12 | Student ไม่เห็นปุ่ม [ลบ] (เห็นแค่ [ขอลบ]) | ☐ |
| 13 | Admin กด [ลบ] บนโพสต์ใดก็ได้ → confirm → ลบทันที (event + images from storage) | ☐ |
| 14 | Admin กด [+ เพิ่มการส่งแข่ง] → form → ใส่ชื่อเวที + deadline (หรือ "ยังไม่รู้") → save → เห็นใน timeline | ☐ |
| 15 | Submission card: deadline แสดง countdown badge (หรือ "ยังไม่กำหนด" ถ้า null) | ☐ |
| 16 | Admin แก้ไข submission event → เติม deadline ที่เคยเป็น null → countdown เริ่มทำงาน | ☐ |
| 17 | Admin กด [+ เพิ่มผลลัพธ์] → dropdown เลือก submission → auto-fill ชื่อเวที → เลือกผล → save | ☐ |
| 18 | Result card: แสดง badge ผลลัพธ์ (pass/fail/award) + linked ไปยัง submission ที่เลือก | ☐ |
| 19 | Admin กด star icon → isHighlight toggle → star เปลี่ยนสี | ☐ |
| 20 | Timeline filter: กด "submission" → แสดงเฉพาะ submission events | ☐ |
| 21 | Student ไม่เห็นปุ่ม [+ เพิ่มการส่งแข่ง] และ [+ เพิ่มผลลัพธ์] | ☐ |
| 22 | `npm run build` สำเร็จ ไม่มี TS error | ☐ |

---

# ═══════════════════════════════════════════
# PHASE 4 — Admin Dashboard + Analytics
# ═══════════════════════════════════════════

## 🎯 เป้าหมาย
Admin dashboard ทำงานครบ: stats cards, filter by date/category/status/academicYear, charts (Recharts), deadline tracker, activity feed, delete request queue

## 📌 Phase ก่อนหน้าทำอะไรไปแล้ว
- Phase 0-1: Setup + Auth + UI + Layout
- Phase 2: User CRUD + Project CRUD + Invite code
- Phase 3: Timeline (post/edit/delete/submission/result) + Image upload + Flexible dates

## 📋 Checklist — ทำให้ครบทุกข้อ

### 4.1 Dashboard Data Layer (`src/lib/firestore/dashboard.ts`)
- [ ] `getStats(filters): Promise<DashboardStats>`
  - โครงงานทั้งหมด (active)
  - ส่งแข่งแล้ว (ในช่วงที่เลือก)
  - รอประกาศผล
  - ผ่าน/ได้รางวัล
  - เลย deadline (ยังไม่ submit)
  - คำขอลบรอดำเนินการ
- [ ] `getEventsByMonth(filters): Promise<{ month: string, count: number }[]>` → สำหรับ bar chart
- [ ] `getResultDistribution(filters): Promise<{ result: string, count: number }[]>` → สำหรับ donut
- [ ] `getCategoryDistribution(): Promise<{ category: string, count: number }[]>` → สำหรับ pie
- [ ] `getUpcomingDeadlines(): Promise<TimelineEvent[]>` → sorted by deadline ASC, exclude null + past
- [ ] `getRecentActivity(limit): Promise<TimelineEvent[]>` → Collection Group Query, newest first
- [ ] `getPendingDeleteRequests(): Promise<{ event: TimelineEvent, project: Project }[]>`

### 4.2 Dashboard Hook (`src/hooks/useDashboardStats.ts`)
- [ ] `useDashboardStats(filters)` → `{ stats, eventsByMonth, resultDist, categoryDist, deadlines, activity, deleteRequests, loading, refresh }`
- [ ] filters: `{ dateRange: { start: Date, end: Date } | 'thisMonth' | 'thisYear', category?: string, status?: string, academicYear?: string }`

### 4.3 Filter Bar (`FilterBar.tsx`)
- [ ] **ช่วงเวลา:** preset buttons (เดือนนี้ / ปีนี้) + custom date range picker
- [ ] **หมวดหมู่:** dropdown จาก categories setting ← V3 fix: predefined list
- [ ] **สถานะ:** dropdown (active / archived / ทั้งหมด)
- [ ] **ปีการศึกษา:** dropdown (ดึง distinct values จาก projects) ← V3 fix
- [ ] Sticky top, glass style
- [ ] เมื่อเปลี่ยน filter → re-fetch dashboard data

### 4.4 Stats Cards (6 cards)
- [ ] **StatsCard.tsx:** glass card + large number (48px, bold, count-up animation) + icon (accent color) + label
- [ ] Layout: 4 columns desktop, 2 columns tablet, 2 columns mobile
- [ ] Cards:
  1. โครงงานทั้งหมด (blue, icon: folder)
  2. ส่งแข่งแล้ว (purple, icon: send)
  3. รอประกาศผล (yellow, icon: clock)
  4. ผ่าน/ได้รางวัล (green, icon: trophy)
  5. เลย deadline (red, icon: alert)
  6. คำขอลบ (orange, icon: trash)

### 4.5 Charts (Recharts)
- [ ] **EventBarChart.tsx:** Bar chart — จำนวน event ต่อเดือน (responsive, animated on mount)
- [ ] **ResultDonutChart.tsx:** Donut chart — pass / fail / award / pending (with legend)
- [ ] **CategoryPieChart.tsx:** Pie chart — projects by category
- [ ] Layout: 2 columns desktop, stack on mobile
- [ ] ทุก chart ต้อง handle empty state (ไม่มีข้อมูล → แสดงข้อความ)

### 4.6 Deadline Tracker (`DeadlineTracker.tsx`)
- [ ] Glass card
- [ ] Sorted list ของ upcoming deadlines
- [ ] Group by เดือน (header "พฤษภาคม 2569", "มิถุนายน 2569")
- [ ] Each item: ชื่อเวที + ชื่อ project + deadline date + countdown
- [ ] Color coding:
  - 🔴 < 3 วัน
  - 🟡 < 7 วัน
  - 🟢 > 7 วัน
- [ ] Click → navigate to project page

### 4.7 Activity Feed (`ActivityFeed.tsx`)
- [ ] Glass card
- [ ] List 20 recent events จากทุก project (Collection Group Query)
- [ ] Each item: relative time + project name + type badge + title + creator name
- [ ] Click → navigate to project page

### 4.8 Delete Request Queue (`DeleteRequestQueue.tsx`)
- [ ] Glass card
- [ ] List pending delete requests
- [ ] Each item: project name + event title + requested by + reason + requested at
- [ ] 2 buttons: [อนุมัติ] (danger) + [ปฏิเสธ] (secondary)
- [ ] [อนุมัติ] → ConfirmDialog → delete event + attachments
- [ ] [ปฏิเสธ] → ConfirmDialog → reset deleteRequested
- [ ] ถ้าไม่มี requests → EmptyState "ไม่มีคำขอลบ"

### 4.9 Admin Dashboard Page Assembly (`/admin/page.tsx`)
- [ ] Compose ทุก component ข้างบน:
  1. FilterBar (sticky top)
  2. Stats Cards (grid)
  3. Charts (2 columns)
  4. Deadline Tracker
  5. Delete Request Queue (ถ้ามี)
  6. Activity Feed

---

## ✅ CHECKPOINT 4 — ต้องผ่านทั้งหมดก่อนไป Phase 5

| # | Check | Pass? |
|---|-------|-------|
| 1 | เข้า `/admin` → เห็น dashboard ครบทุก section | ☐ |
| 2 | Stats cards แสดงตัวเลขถูกต้อง (ลอง manual count ข้อมูลใน Firestore เทียบ) | ☐ |
| 3 | Stats cards มี count-up animation | ☐ |
| 4 | เปลี่ยน filter "เดือนนี้" → stats + charts อัปเดต | ☐ |
| 5 | เปลี่ยน filter "ปีนี้" → stats + charts อัปเดต | ☐ |
| 6 | เลือก custom date range → stats + charts อัปเดต | ☐ |
| 7 | Filter by category → stats ของ category นั้นเท่านั้น | ☐ |
| 8 | Filter by academicYear → projects ปีนั้นเท่านั้น | ☐ |
| 9 | Bar chart แสดง events ต่อเดือน + animated | ☐ |
| 10 | Donut chart แสดง pass/fail/award/pending + legend | ☐ |
| 11 | Pie chart แสดง projects by category | ☐ |
| 12 | Charts handle empty state (ไม่ crash ถ้าไม่มีข้อมูล) | ☐ |
| 13 | Deadline tracker: sorted, grouped by month, color-coded | ☐ |
| 14 | Deadline tracker: click item → ไป project page | ☐ |
| 15 | Activity feed: 20 items ล่าสุด, correct info | ☐ |
| 16 | Delete request queue: แสดง pending requests | ☐ |
| 17 | กด [อนุมัติ] → event ถูกลบ + หายจาก queue | ☐ |
| 18 | กด [ปฏิเสธ] → event กลับมาปกติ + หายจาก queue | ☐ |
| 19 | Responsive: ทุก section แสดงถูกต้องบน mobile | ☐ |
| 20 | `npm run build` สำเร็จ ไม่มี TS error | ☐ |

---

# ═══════════════════════════════════════════
# PHASE 5 — Portfolio Preview
# ═══════════════════════════════════════════

## 🎯 เป้าหมาย
Portfolio preview page ที่แสดง highlight events, shareable link (public access ถ้า isPublic=true), print-friendly

## 📌 Phase ก่อนหน้าทำอะไรไปแล้ว
- Phase 0-3: Setup + Auth + UI + User/Project CRUD + Timeline (complete)
- Phase 4: Dashboard + Analytics + Delete request queue

## 📋 Checklist — ทำให้ครบทุกข้อ

### 5.1 Portfolio Data
- [ ] `getPortfolioData(projectId)`:
  - Project info (title, titleEn, category, academicYear)
  - Students (fetch from users by studentIds) → names, classRoom
  - Advisors (fetch from advisors by advisorIds) → title + name
  - Competition summary: list submission + result events → สรุปเป็น table
  - Highlighted timeline: events where isHighlight == true, sorted by createdAt ASC

### 5.2 Portfolio Preview Page (`/project/[id]/preview/page.tsx`)
- [ ] **Auth logic:** ← V3 fix
  - ถ้า `project.isPublic == true` → ไม่ต้อง auth, ใครก็เข้าได้
  - ถ้า `isPublic == false` → ต้อง auth + เป็น admin หรือ member
  - URL: `/project/[id]/preview` (share link ตรงนี้เลย)
- [ ] **Layout:**
  - max-width: 800px, centered
  - background: white (ไม่ใช้ glass — ต้อง screenshot ได้สวย)
  - padding: comfortable
  - ไม่มี nav, sidebar, footer

### 5.3 PortfolioHeader.tsx
- [ ] ชื่อโครงงาน (TH, ใหญ่สุด)
- [ ] ชื่อภาษาอังกฤษ (ถ้ามี)
- [ ] หมวดหมู่ + ปีการศึกษา
- [ ] รายชื่อนักเรียน (ชื่อ + ห้อง)
- [ ] ครูที่ปรึกษา (คำนำหน้า + ชื่อ)

### 5.4 PortfolioSummary.tsx
- [ ] ตาราง: เวทีที่ส่งแข่ง + ผลลัพธ์
  - columns: ชื่อเวที, วันที่ส่ง, ผลลัพธ์ (badge)
  - ดึงจาก submission + result events (linked)

### 5.5 PortfolioTimeline.tsx
- [ ] แสดงเฉพาะ events ที่ `isHighlight == true`
- [ ] แนวตั้ง, simple design (ไม่ glass — clean for print)
- [ ] แต่ละ event: วันที่ + หัวข้อ + description + รูป (ถ้ามี — แสดงเล็กๆ)

### 5.6 Print-Friendly CSS
- [ ] `@media print` rules:
  - ซ่อน UI ที่ไม่จำเป็น
  - สีพื้นขาว
  - font สีดำ
  - page-break-inside: avoid สำหรับ cards

### 5.7 Share UI (admin only, ในหน้า project edit)
- [ ] Toggle `isPublic` → show/hide share link
- [ ] Copy share link button
- [ ] Preview: "ลิงก์นี้สามารถเข้าดูได้โดยไม่ต้อง login"

---

## ✅ CHECKPOINT 5 — ต้องผ่านทั้งหมดก่อนไป Phase 6

| # | Check | Pass? |
|---|-------|-------|
| 1 | เข้า `/project/[id]/preview` (login อยู่) → เห็น portfolio ครบ: header, summary, timeline | ☐ |
| 2 | Portfolio แสดงเฉพาะ isHighlight events (ไม่แสดง events ที่ไม่ highlight) | ☐ |
| 3 | ตาราง competition summary แสดงถูกต้อง: เวที + ผลลัพธ์ | ☐ |
| 4 | Admin toggle isPublic = true → share link ทำงาน | ☐ |
| 5 | ไม่ login + isPublic = true → เข้า preview ได้ | ☐ |
| 6 | ไม่ login + isPublic = false → redirect ไป login | ☐ |
| 7 | Ctrl+P → print preview สวย (ไม่มี nav, สีดำขาว, page break ถูกที่) | ☐ |
| 8 | Mobile: portfolio แสดงถูกต้อง | ☐ |
| 9 | `npm run build` สำเร็จ ไม่มี TS error | ☐ |

---

# ═══════════════════════════════════════════
# PHASE 6 — Polish + Animation + Final QA
# ═══════════════════════════════════════════

## 🎯 เป้าหมาย
ขัดเกลา UI ให้สวยหรู, เพิ่ม animation, fix edge cases, test ครบ flow

## 📌 Phase ก่อนหน้าทำอะไรไปแล้ว
- ทุก feature ทำงานได้ครบแล้ว (Auth, User CRUD, Project CRUD, Timeline, Dashboard, Portfolio)

## 📋 Checklist — ทำให้ครบทุกข้อ

### 6.1 Animations
- [ ] Card entrance: fade-in + translate-y 10px (stagger 50ms between cards)
- [ ] Stats number: count-up animation เมื่อ card เข้ามาใน viewport (Intersection Observer)
- [ ] Page transition: subtle opacity fade (CSS transition)
- [ ] Modal: fade-in overlay + scale-up card (from 0.95 to 1)
- [ ] Toast: slide-in from right + auto-dismiss after 3s
- [ ] Post composer: expand animation (height 0 → auto)
- [ ] Hover states: ทุก glass card มี hover effect (bg เข้มขึ้น + shadow ขยาย)

### 6.2 Liquid Glass Polish
- [ ] Background: gradient mesh ที่สวย (2-3 radial-gradient ซ้อนกัน สีอ่อนมาก)
- [ ] Glass cards: ตรวจสอบว่า blur + border + shadow สม่ำเสมอทุกหน้า
- [ ] Dark mode consideration: ถ้าไม่ทำ dark mode → ตรวจสอบว่า light mode สวยครบทุกหน้า
- [ ] Loading skeleton: ใช้ shimmer effect แทน spinner สำหรับ content loading

### 6.3 Error Handling (ทุกหน้า)
- [ ] Network error → Toast "เชื่อมต่อไม่ได้ — ลองใหม่"
- [ ] Firestore permission denied → Toast "ไม่มีสิทธิ์"
- [ ] Image upload fail (partial) → ถามผู้ใช้ ← V3 fix
- [ ] Invalid invite code → error message ชัดเจน
- [ ] 404 project → EmptyState "ไม่พบโครงงาน"
- [ ] Session expired → redirect to login

### 6.4 Edge Cases
- [ ] Project ที่ไม่มีนักเรียน → แสดงถูกต้อง (ไม่ crash)
- [ ] Project ที่ไม่มี advisor → แสดงถูกต้อง
- [ ] Timeline ที่มี 0 events → EmptyState
- [ ] Timeline ที่มี 100+ events → pagination ทำงานถูกต้อง
- [ ] Student ที่อยู่หลาย projects → ดูได้ทุก project
- [ ] Admin ลบ student ที่มี posts → posts ยังอยู่ (แค่แสดงว่าโพสต์โดย "[ผู้ใช้ที่ถูกลบ]")
- [ ] Invite code maxUses = 1 → student คนที่ 2 ใช้ไม่ได้
- [ ] Invite code maxUses = 5 → student คนที่ 6 ใช้ไม่ได้

### 6.5 Performance Check
- [ ] Lighthouse score > 80 (Performance)
- [ ] Images lazy loaded (Intersection Observer)
- [ ] No unnecessary re-renders (React DevTools check)
- [ ] Bundle size reasonable (< 500KB first load)

### 6.6 Responsive Final Check
- [ ] Desktop (1440px): ทุกหน้าสวย
- [ ] Tablet (768px): ทุกหน้าใช้งานได้
- [ ] Mobile (375px): ทุกหน้าใช้งานได้ + bottom nav

---

## ✅ CHECKPOINT 6 (FINAL) — ก่อน Production Release

| # | Check | Pass? |
|---|-------|-------|
| 1 | **Full Flow - Admin:** login → สร้าง student → สร้าง advisor → สร้าง project (เลือก advisor + student + invite code + initial submission) → เข้า project → สร้าง submission event → สร้าง result event (link submission) → toggle highlight → เข้า dashboard → filter ทำงาน → charts แสดงถูก → delete request approve → preview portfolio → toggle isPublic → share link ทำงาน | ☐ |
| 2 | **Full Flow - Student:** ใช้ invite code → join project → เข้า student dashboard → เห็น project → เข้า project → โพสต์ progress (text + 5 รูป + 1 link) → แก้ไขโพสต์ → ขอลบโพสต์ → preview portfolio | ☐ |
| 3 | **Full Flow - Public:** ไม่ login → เข้า portfolio preview link (isPublic project) → เห็นข้อมูลครบ | ☐ |
| 4 | ทุก animation smooth (ไม่กระตุก) | ☐ |
| 5 | ทุกหน้า responsive (desktop + tablet + mobile) | ☐ |
| 6 | ไม่มี console error ใน browser | ☐ |
| 7 | `npm run build` สำเร็จ ไม่มี warning | ☐ |
| 8 | Deploy บน Vercel สำเร็จ + ทุก feature ทำงานบน production | ☐ |

---

# 📝 Notes สำหรับ AI ที่จะมา Implement

## กฎสำคัญ

1. **อ่าน spec V3 (`coolnut-stem-spec-v3.md`) ก่อนเริ่มทุกครั้ง** — ใช้เป็น source of truth สำหรับ data model, permissions, UI wireframe
2. **ทำทีละ Phase** — อย่าข้าม Phase, อย่ารวม Phase
3. **ทำ checklist ให้ครบทุกข้อ** — ทุกข้อที่มี [ ] ต้องทำ ห้ามข้าม
4. **Run checkpoint ก่อนไป Phase ถัดไป** — ถ้าข้อไหนไม่ผ่าน ต้องแก้ก่อน
5. **ใช้ Types จาก `src/types/index.ts` เสมอ** — ห้ามสร้าง inline type
6. **ใช้ UI components จาก `src/components/ui/` เสมอ** — ห้ามสร้าง one-off styled div
7. **ทุกข้อความ UI เป็นภาษาไทย** — labels, buttons, placeholders, error messages, empty states
8. **V3 Fixes ที่ต้องจำ:**
   - Result event ต้องมี `linkedSubmissionId` (dropdown เลือก submission)
   - Invite code รองรับ multi-use (`maxUses`)
   - Student ที่ login อยู่แล้วสามารถ join project ด้วย code ได้
   - Storage security rules ต้อง deploy
   - Timeline ในหน้า project มี filter by type + search
   - Portfolio preview รองรับ public access (`isPublic`)
   - Project มี `academicYear` field
   - Categories เป็น predefined list (ไม่ใช่ free text)
   - Upload fail handling: ถาม user ว่าจะข้ามหรือลองใหม่

## ข้อผิดพลาดที่ต้องระวัง

- **อย่าลืม `"use client"` directive** สำหรับ components ที่ใช้ hooks, onClick, useState
- **อย่าลืม Firestore indexes** — composite queries จะ fail ถ้าไม่ deploy indexes
- **อย่า hardcode Firebase config** — ใช้ env vars เสมอ
- **อย่า `import { ... } from 'firebase'`** — ใช้ modular imports: `from 'firebase/firestore'`
- **อย่าใช้ `onSnapshot` (realtime)** — spec กำหนดให้ใช้ `getDocs` + manual refresh
- **อย่าใช้ `localStorage` ใน artifacts** — ใช้ React state
- **Firestore `get()` ใน security rules นับ 1 read** — ระวัง cost
- **`enableIndexedDbPersistence` ต้องเรียกก่อน query แรก** — ใส่ใน firebase.ts init

---

# End of Development Plan — STEMFOLIO
