# STEMFOLIO — Project Documentation

## ภาพรวม
ระบบ STEM Project Lifecycle & Portfolio สำหรับโรงเรียนไทย ให้นักเรียนบันทึกความคืบหน้าโครงงาน ติดตามการส่งแข่งขัน และสร้าง portfolio แบบพิมพ์ได้ มี 2 role: `admin` (ครู/ผู้ดูแล) และ `student` (นักเรียน)

---

## Tech Stack
| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router), React 19, TypeScript |
| Styling | TailwindCSS v4 (`@import "tailwindcss"` ใน globals.css) |
| Backend | Firebase: Auth (Google OAuth), Firestore, Storage |
| Cloud Functions | Firebase Functions (Node.js) — ใช้สำหรับ `setAdminRole` |
| Charts | Recharts |
| Icons | lucide-react |
| Date | date-fns |
| Image | browser-image-compression |

> **หมายเหตุ**: TailwindCSS v4 — ไม่มี `tailwind.config.js`, ใช้ `@import "tailwindcss"` แทน `@tailwind base/components/utilities`

---

## โครงสร้างไฟล์ (src/)

```
src/
├── app/
│   ├── (auth)/                    # Route group: ไม่มี dashboard layout
│   │   ├── login/page.tsx
│   │   ├── complete-profile/page.tsx
│   │   ├── pending-approval/page.tsx
│   │   └── rejected/page.tsx
│   ├── (dashboard)/               # Route group: มี sidebar/topbar
│   │   ├── layout.tsx             # Dashboard shell + AuthGuard
│   │   ├── admin/page.tsx         # Admin dashboard (charts, stats)
│   │   ├── admin/projects/page.tsx
│   │   ├── admin/projects/new/page.tsx
│   │   ├── admin/students/page.tsx
│   │   ├── admin/advisors/page.tsx
│   │   ├── student/page.tsx       # นักเรียนดูโครงงานตัวเอง + join ด้วย invite code
│   │   └── project/[id]/
│   │       ├── page.tsx           # Timeline feed ของโครงงาน
│   │       └── edit/page.tsx
│   ├── project/[id]/preview/page.tsx  # Portfolio preview (ไม่มี dashboard layout, print-friendly)
│   ├── page.tsx                   # Root: redirect ตาม role
│   ├── layout.tsx                 # Root layout: ThemeProvider, ToastProvider, AuthProvider
│   └── globals.css                # CSS variables + Tailwind v4
│
├── components/
│   ├── layout/
│   │   ├── AuthGuard.tsx          # Route protection + role check
│   │   ├── Sidebar.tsx
│   │   ├── TopBar.tsx
│   │   ├── BottomNav.tsx          # Mobile nav
│   │   └── ThemeProvider.tsx
│   ├── features/
│   │   ├── Dashboard/             # StatsCard, charts, ActivityFeed, DeleteRequestQueue, PendingUserQueue, FilterBar, DeadlineTracker
│   │   ├── Timeline/              # PostComposer, TimelineCard, SubmissionForm, ResultForm, EditEventModal, ImageUploader, LinkAttachment
│   │   ├── Portfolio/             # PortfolioHeader, PortfolioSummary, PortfolioTimeline
│   │   └── ProjectForm.tsx
│   └── ui/                        # GlassCard, Button, Input, Modal, Badge, Select, TextArea, DatePicker, Toast, Spinner, Skeleton, EmptyState, ImageLightbox, ConfirmDialog, ProjectCard, ThemeToggle
│
├── hooks/
│   ├── useAuth.tsx                # AuthContext + AuthProvider
│   ├── useProject.ts
│   ├── useTimeline.ts
│   ├── useDashboardStats.ts
│   ├── useStudents.ts
│   ├── useAdvisors.ts
│   └── useImageUpload.ts
│
├── lib/
│   ├── firebase.ts                # Firebase init (Firestore persistent cache)
│   ├── auth.ts                    # signInWithGoogle, onAuthStateChange, updateProfile
│   ├── storage.ts                 # uploadImage, uploadImages, deleteImages
│   ├── compress.ts                # compressForUpload (browser-image-compression)
│   └── firestore/
│       ├── projects.ts            # CRUD + listProjects, listProjectsByStudent
│       ├── timeline.ts            # CRUD + requestDelete/approveDelete/rejectDelete
│       ├── users.ts               # getUser, listUsers, linkStudentToProject
│       ├── advisors.ts
│       ├── inviteCodes.ts         # generateInviteCode, validateCode, redeemCode
│       ├── settings.ts            # getCategories, updateCategories
│       ├── portfolio.ts           # getPortfolioData
│       └── dashboard.ts           # getDashboardStats, filters
│
└── types/index.ts                 # TypeScript interfaces ทั้งหมด
```

---

## Data Models (Firestore)

### Collections
```
users/{uid}
projects/{projectId}
projects/{projectId}/timeline/{eventId}   ← subcollection
advisors/{advisorId}
inviteCodes/{code}
settings/categories
```

### Types สำคัญ

**User**
```ts
{ id, email, name, nickname?, role: 'admin'|'student',
  profileImageUrl?, studentId?, classRoom?, phone?,
  competitionEmail?, competitionPhone?,
  status?: 'pending'|'approved'|'rejected',
  projectIds: string[], createdAt, updatedAt }
```

**Project**
```ts
{ id, title, titleEn?, category, advisorIds: string[],
  studentIds: string[], status: 'active'|'archived',
  coverImageUrl?, description?, academicYear: string,
  isPublic: boolean, createdBy, createdAt, updatedAt,
  timelineEventCount? }
```

**TimelineEvent**
```ts
{ id, type: 'progress'|'submission'|'result',
  title, description, createdBy, createdAt, updatedAt,
  isHighlight: boolean, attachments: Attachment[],
  // submission fields:
  competitionName?, deadline?, submittedDate?,
  submissionStatus?: 'draft'|'submitted',
  // result fields:
  linkedSubmissionId?, result?: 'pending'|'pass'|'fail'|'award',
  announcementDate?, announcementUrl?,
  // delete request:
  deleteRequested: boolean, deleteRequestedBy?,
  deleteRequestedAt?, deleteRequestReason? }
```

**InviteCode**
```ts
{ code: string (6 chars uppercase), projectId, createdBy,
  createdAt, maxUses: number, usedCount: number, usedBy: string[] }
```

---

## Auth Flow

```
Google OAuth
  → สร้าง Firestore user doc (role='student', status='pending')
  → complete-profile (กรอก name, classRoom, studentId)
  → รอ admin approve (status: pending → approved)
  → เข้าใช้งานได้
```

- Role เก็บใน `users/{uid}.role` (ไม่ใช่แค่ JWT custom claims)
- `onAuthStateChange` อ่าน userDoc จาก Firestore พร้อมกับ Firebase Auth state
- Admin สามารถ bypass pending/rejected check

---

## Firestore Security Rules สรุป
- `isAdmin()` = อ่าน role จาก Firestore users collection (ไม่ใช่ custom claims)
- **users**: อ่าน = เจ้าของ/admin | แก้ไข = เจ้าของ (ห้ามเปลี่ยน role) / admin
- **projects**: อ่าน = admin หรือ studentIds member | CRUD = admin เท่านั้น
- **timeline**: สร้าง `progress` = member | สร้าง `submission`/`result` = admin | ลบ = admin
- **inviteCodes**: สร้าง = admin | update (redeem) = ทุกคนที่ login (ถ้ายังไม่เต็ม)

---

## Design System

**Liquid Glass UI** — CSS variables ใน `:root` และ `.dark`:
```css
--glass-bg, --glass-bg-hover, --glass-border, --glass-shadow, --glass-blur
--accent-blue: #007AFF, --accent-green: #34C759, --accent-red: #FF3B30
--accent-yellow: #FFCC00, --accent-purple: #AF52DE, --accent-orange: #FF9500
--radius-card: 20px, --radius-button: 14px, --radius-input: 12px
```

- **GlassCard**: `backdrop-blur-[20px] backdrop-saturate-[180%]` — ใช้แทน card ทั่วไป
- Dark mode: `next-themes` attribute="class"
- Font: Inter
- Background: radial-gradient fixed (blue/purple/green glow)
- Animation: `.page-transition` (fadeIn + slideUp), `.shimmer` (skeleton loading)

---

## Feature Flows

### นักเรียน
1. Login → complete profile → รอ approve
2. Dashboard (`/student`): เห็นรายการโครงงาน + กรอก invite code เพื่อ join
3. Project detail (`/project/[id]`): ดู timeline feed, โพสต์ความคืบหน้า (type=progress), ขอลบ event
4. Portfolio preview (`/project/[id]/preview`): ดู portfolio สวยงาม, พิมพ์/PDF

### Admin
1. Dashboard (`/admin`): Stats cards, bar/donut/pie charts, deadline tracker, activity feed, pending users queue, delete request queue
2. Projects (`/admin/projects`): สร้าง/แก้ไข/archive โครงงาน, generate invite codes
3. Students (`/admin/students`): approve/reject ผู้ใช้ใหม่
4. Advisors (`/admin/advisors`): CRUD ครูที่ปรึกษา
5. Timeline: เพิ่ม submission/result events, approve delete requests

---

## Image Upload Pipeline
```
File → compressForUpload (browser-image-compression)
     → uploadBytesResumable to Firebase Storage
     → path: projects/{projectId}/timeline/{eventId}/{uuid}.jpg
     → getDownloadURL → เก็บใน TimelineEvent.attachments[]
```
- ลบรูป: parse URL path → `deleteObject`

---

## Environment Variables (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## Cloud Functions
- `functions/src/index.ts`: `setAdminRole` — callable function สำหรับ set custom claims `{ role: "admin" }` (ใช้ตอน setup เท่านั้น ปัจจุบัน role ใช้จาก Firestore)

---

## Coding Conventions
- ทุกหน้าใช้ `"use client"` (ไม่มี Server Components)
- Firestore: ใช้ persistent local cache + multi-tab manager
- State management: React hooks เท่านั้น (ไม่มี Redux/Zustand)
- Toast notifications: `useToast()` จาก `components/ui/Toast`
- Loading states: `<Skeleton>` component
- Empty states: `<EmptyState>` component
- Form inputs: `<Input>`, `<TextArea>`, `<Select>`, `<DatePicker>` จาก components/ui
- Modals: `<Modal>` component wrapper
- Confirm dialogs: `<ConfirmDialog>`
- Image preview: `<ImageLightbox>`
- หมวดหมู่โครงงาน: เก็บใน Firestore `settings/categories` (admin แก้ได้)

---

## Portfolio Preview
- Route: `/project/[id]/preview` (นอก dashboard layout)
- Access control: ถ้า `isPublic=true` ทุกคนดูได้, ถ้า `false` ต้อง login + เป็น member/admin
- Print-friendly: `print:hidden` class สำหรับ action bar
- แสดง: project header, submission summary, highlighted timeline events
