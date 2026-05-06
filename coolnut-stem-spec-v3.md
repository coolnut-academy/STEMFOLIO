# STEMFOLIO

> V3 Changes: เพิ่ม User Management (CRUD), ปรับ Posting ให้เป็นแบบ Padlet-like, เพิ่ม Delete Request flow, ปรับ Image Upload เป็น multi-upload + client-side compression แบบ A4 max, รองรับ flexible dates ที่เพิ่มทีหลังได้

---

## 1. System Goals

### Core Objectives

- ติดตามโครงงาน STEM ทุกโปรเจกต์ในที่เดียว (Single Source of Truth)
- บันทึก lifecycle ตั้งแต่เริ่มต้นจนจบแข่ง ผ่าน timeline เดียว
- ให้ admin (ครู) เห็นภาพรวมสถิติ + filter ตามช่วงเวลาได้
- จัดการข้อมูลผู้ใช้ (นักเรียน + ครูที่ปรึกษา) ได้ครบถ้วน
- ให้ทุกคนโพสต์ได้อิสระแบบ Padlet แต่มี admin control สำหรับการลบ
- สร้าง portfolio อัตโนมัติจาก timeline สำหรับนักเรียน

---

## 2. User Roles & Permissions Matrix

### 2.1 Roles

| Role    | คำอธิบาย                                |
| ------- | --------------------------------------- |
| Admin   | ครูผู้ดูแลระบบ (มีได้หลายคน)            |
| Student | นักเรียนในโครงงาน                       |

### 2.2 Permissions Matrix

| Action                              | Admin | Student |
| ----------------------------------- | :---: | :-----: |
| **User Management**                 |       |         |
| ดูรายชื่อผู้ใช้ทั้งหมด                | ✅    | ❌      |
| เพิ่ม/แก้ไข/ลบ ข้อมูลนักเรียน         | ✅    | ❌      |
| เพิ่ม/แก้ไข/ลบ ข้อมูลครูที่ปรึกษา     | ✅    | ❌      |
| แก้ไขข้อมูลตัวเอง (ชื่อ, รูป profile) | ✅    | ✅      |
| **Project Management**              |       |         |
| สร้างโครงงานใหม่                      | ✅    | ❌      |
| แก้ไขข้อมูลโครงงาน                    | ✅    | ❌      |
| Archive โครงงาน                      | ✅    | ❌      |
| ดูโครงงาน                            | ✅    | เฉพาะของตัวเอง |
| **Timeline Posting (Padlet-like)**   |       |         |
| โพสต์ข้อความ + รูป + link             | ✅    | ✅      |
| แก้ไขโพสต์ของตัวเอง                   | ✅    | ✅      |
| ลบโพสต์ตัวเองทันที                    | ✅    | ❌      |
| ขอลบโพสต์ตัวเอง (delete request)      | —     | ✅      |
| อนุมัติ / ปฏิเสธ delete request       | ✅    | ❌      |
| เพิ่ม submission / result event       | ✅    | ❌      |
| toggle isHighlight                   | ✅    | ❌      |

---

## 3. Auth Flow (Firebase Auth)

### Admin
- login ด้วย email/password
- custom claim `role: "admin"` ตั้งผ่าน Cloud Function

### Student
- ครูสร้าง invite code ต่อ project (random 6 ตัวอักษร)
- นักเรียนเข้าหน้า `/join` → ใส่ invite code → สร้าง account (email/password)
- ระบบ link student เข้า project อัตโนมัติ + invalidate code

```
inviteCodes/{code}
  - projectId: string
  - createdBy: string (adminId)
  - createdAt: Timestamp
  - used: boolean
  - usedBy: string | null
```

---

## 4. Tech Stack

| Layer              | Technology                                     |
| ------------------ | ---------------------------------------------- |
| Frontend           | Next.js 15 (App Router), React, Tailwind CSS   |
| Auth               | Firebase Auth + Custom Claims                  |
| Database           | Firestore                                      |
| File Storage       | Firebase Storage                               |
| Hosting            | Vercel                                         |
| Source Control      | GitHub                                         |
| Cloud Functions    | Firebase Cloud Functions (claims, invite, etc.) |
| Image Compression  | browser-image-compression (client-side)        |
| Charts             | Recharts                                       |

---

## 5. Data Model

### 5.1 Users

```
users/{userId}
  - email: string
  - name: string
  - nickname: string (ชื่อเล่น — optional)
  - role: "admin" | "student"
  - profileImageUrl: string | null
  - studentId: string | null         ← เลขประจำตัวนักเรียน (สำหรับ student)
  - classRoom: string | null         ← ห้องเรียน (e.g. "ม.5/1")
  - phone: string | null
  - projectIds: string[]
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### 5.2 Advisors (ครูที่ปรึกษา — แยกจาก admin)

> ครูที่ปรึกษาไม่จำเป็นต้องมี account ในระบบ (บางคนอาจเป็นครูภายนอก)
> เก็บเป็น collection แยกเพื่อ reuse ข้ามหลาย project

```
advisors/{advisorId}
  - name: string
  - title: string | null             ← คำนำหน้า (e.g. "ครู", "ดร.", "ผศ.")
  - department: string | null        ← กลุ่มสาระ / สังกัด
  - phone: string | null
  - email: string | null
  - createdBy: string (adminId)
  - createdAt: Timestamp
```

### 5.3 Projects

```
projects/{projectId}
  - title: string
  - titleEn: string | null           ← ชื่อภาษาอังกฤษ (บางเวทีต้องใช้)
  - category: string                 ← "ฟิสิกส์" | "ชีววิทยา" | "คอมพิวเตอร์" | etc.
  - advisorIds: string[]             ← ref → advisors collection
  - studentIds: string[]             ← ref → users collection
  - status: "active" | "archived"
  - coverImageUrl: string | null
  - description: string | null       ← คำอธิบายโครงงานสั้นๆ
  - createdBy: string (adminId)
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### 5.4 Timeline Events (Unified)

```
projects/{projectId}/timeline/{eventId}
  - type: "progress" | "submission" | "result"
  - title: string
  - description: string              ← รองรับ multi-line, plain text
  - createdBy: string (userId)
  - createdAt: Timestamp
  - updatedAt: Timestamp
  - isHighlight: boolean

  // === Attachments (ทุก type ใช้ได้) ===
  - attachments: Attachment[]

  // === สำหรับ type === "submission" ===
  - competitionName: string | null
  - deadline: Timestamp | null       ← ⭐ nullable — เพิ่มทีหลังได้
  - submittedDate: Timestamp | null  ← วันที่ส่งจริง — เพิ่มทีหลังได้
  - submissionStatus: "draft" | "submitted"

  // === สำหรับ type === "result" ===
  - competitionName: string | null
  - result: "pending" | "pass" | "fail" | "award"
  - announcementDate: Timestamp | null  ← ⭐ nullable — ยังไม่รู้วันประกาศ
  - announcementUrl: string | null

  // === Delete Request ===
  - deleteRequested: boolean         ← student ขอลบ
  - deleteRequestedBy: string | null
  - deleteRequestedAt: Timestamp | null
  - deleteRequestReason: string | null
```

### 5.5 Attachment Type

```typescript
interface Attachment {
  id: string               // uuid สำหรับ identify แต่ละไฟล์
  url: string              // Firebase Storage URL หรือ external URL
  type: "image" | "link" | "video"
  name: string
  thumbnailUrl?: string    // สำหรับ image — ใช้ url เดียวกันได้ (เพราะ compress แล้ว)
}
```

> **video:** ไม่ upload เข้า Firebase Storage → เก็บเป็น YouTube / Google Drive link ใน attachments โดย type = "video" + url = external link
>
> **link:** URL ภายนอกทั่วไป (เว็บประกาศผล, เว็บแข่งขัน, etc.)

---

## 6. Feature Detail: User Management (Admin Only)

### 6.1 Student Management

**Route:** `/admin/students`

| Action    | รายละเอียด                                           |
| --------- | ---------------------------------------------------- |
| ดูรายชื่อ  | แสดงตาราง: ชื่อ, เลขประจำตัว, ห้อง, โครงงานที่เข้าร่วม |
| ค้นหา     | search by ชื่อ หรือ เลขประจำตัว                       |
| เพิ่ม     | กรอกข้อมูล → สร้าง user doc (ยังไม่ link project)      |
| แก้ไข     | แก้ชื่อ, ห้อง, เบอร์โทร, etc.                         |
| ลบ        | soft delete (ลบออกจาก projectIds, ไม่ลบ account)       |
| link project | เพิ่ม student เข้า project ที่เลือก                 |

**UX:**
- ตารางแบบ glass card
- click row → เปิด drawer/modal แก้ไข
- bulk action: เลือกหลายคน → link เข้า project เดียวกัน

### 6.2 Advisor Management

**Route:** `/admin/advisors`

| Action    | รายละเอียด                                      |
| --------- | ----------------------------------------------- |
| ดูรายชื่อ  | แสดงตาราง: ชื่อ, คำนำหน้า, สังกัด               |
| เพิ่ม     | กรอก: ชื่อ, title, department, phone, email      |
| แก้ไข     | แก้ไขข้อมูลทุก field                             |
| ลบ        | ลบได้ถ้าไม่มี project ใดอ้างอิงอยู่ (หรือ confirm) |

> Advisor เป็น reference data — สร้างครั้งเดียว ใช้ซ้ำข้าม project ได้
> เวลาสร้าง project → เลือก advisor จาก dropdown (autocomplete)

---

## 7. Feature Detail: Project Creation Flow (Admin Only)

### 7.1 Create Project Form

**Route:** `/admin/projects/new`

**Step-by-step form (ไม่ต้องเป็น wizard — form เดียวแต่ section ชัด):**

```
┌─────────────────────────────────────────────┐
│  ➊ ข้อมูลโครงงาน                            │
│  ┌─────────────────────────────────────┐    │
│  │ ชื่อโครงงาน (TH) *                 │    │
│  │ ชื่อโครงงาน (EN)                    │    │
│  │ หมวดหมู่ [dropdown] *               │    │
│  │ คำอธิบาย                            │    │
│  │ ภาพปก [upload 1 รูป]               │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ➋ ครูที่ปรึกษา                              │
│  ┌─────────────────────────────────────┐    │
│  │ [autocomplete — เลือกจาก advisors]  │    │
│  │ + เพิ่มครูที่ปรึกษาใหม่              │    │
│  │ [Advisor 1] [✕]                    │    │
│  │ [Advisor 2] [✕]                    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ➌ นักเรียน                                  │
│  ┌─────────────────────────────────────┐    │
│  │ [autocomplete — เลือกจาก students]  │    │
│  │ + เพิ่มนักเรียนใหม่                  │    │
│  │ [Student 1] [✕]                    │    │
│  │ [Student 2] [✕]                    │    │
│  │                                     │    │
│  │ — หรือ —                             │    │
│  │ [สร้าง Invite Code]  → ABC123      │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ➍ Timeline เริ่มต้น (optional)              │
│  ┌─────────────────────────────────────┐    │
│  │ เพิ่ม events ที่รู้แล้วตอนสร้าง:     │    │
│  │ [+ เพิ่ม submission]                │    │
│  │                                     │    │
│  │ ┌─ Submission 1 ──────────────┐    │    │
│  │ │ ชื่อเวที: YSC 2026          │    │    │
│  │ │ Deadline: [date] หรือ [ยังไม่รู้] │  │    │
│  │ │ วันประกาศผล: [date] หรือ [ยังไม่รู้]│ │    │
│  │ └────────────────────────────┘    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│           [สร้างโครงงาน]                     │
└─────────────────────────────────────────────┘
```

### 7.2 Flexible Dates (ยังไม่รู้ → เพิ่มทีหลัง)

ทุก date field ใน timeline event เป็น **nullable**:

```typescript
// UI: toggle switch ข้าง date picker
☑ ยังไม่ทราบวันที่  →  field = null
☐ ยังไม่ทราบวันที่  →  แสดง date picker

// แสดงใน timeline card:
deadline: null       → แสดง "ยังไม่กำหนด" + badge สีเทา
deadline: May 15     → แสดงวันที่ + countdown badge
```

**เพิ่มทีหลัง:**
- ทุก timeline event มีปุ่ม "แก้ไข" (admin เท่านั้น)
- click → modal → เติม date ที่ยังว่างได้
- เมื่อใส่ deadline → ระบบเริ่มนับ countdown + warning อัตโนมัติ

---

## 8. Feature Detail: Padlet-like Timeline Posting

### 8.1 Concept

ทุกคนในโครงงาน (admin + student) สามารถโพสต์ลง timeline ได้อิสระ คล้าย Padlet:

```
┌─ Timeline ──────────────────────────────────┐
│                                             │
│  ┌─ Post Box (sticky top) ────────────┐    │
│  │ [💬 เขียนอะไรสักหน่อย...]           │    │
│  │                                     │    │
│  │ [📎 รูปภาพ] [🔗 Link] [🎬 Video]   │    │
│  │                          [โพสต์]    │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─ Event Card ───────────────────────┐    │
│  │ 🔵 progress    2 ชม. ที่แล้ว        │    │
│  │ ทดลอง prototype รอบ 2              │    │
│  │ ผลการทดลองพบว่า...                  │    │
│  │ [📷 รูป 1] [📷 รูป 2] [📷 รูป 3]    │    │
│  │ [🔗 Google Doc]                    │    │
│  │                                     │    │
│  │ โดย: สมชาย ม.5/1                    │    │
│  │                     [แก้ไข] [ขอลบ]  │    │
│  └─────────────────────────────────────┘    │
│                                             │
│  ┌─ Event Card (submission) ──────────┐    │
│  │ 🟣 submission                       │    │
│  │ ส่ง YSC 2026 รอบคัดเลือก           │    │
│  │ Deadline: 15 พ.ค. 2569 (อีก 9 วัน) │    │
│  │ สถานะ: ✅ submitted                 │    │
│  │ วันประกาศผล: ยังไม่ทราบ [+ เพิ่ม]   │    │
│  │                                     │    │
│  │ โดย: ครูสาธิต                        │    │
│  │                     [แก้ไข]          │    │
│  └─────────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### 8.2 Post Creation Flow

```
User กดโพสต์
  ↓
เปิด composer (modal หรือ expand inline)
  ↓
กรอก:
  - หัวข้อ (required)
  - รายละเอียด (optional, multi-line)
  - แนบรูป (multi-select, drag & drop)
  - แนบ link (URL + label)
  - แนบ video link (YouTube / Drive URL)
  ↓
กด [โพสต์]
  ↓
Client compress รูปทั้งหมด (ถ้ามี) → parallel upload → save event doc
  ↓
Timeline refresh → เห็นโพสต์ใหม่
```

### 8.3 Delete Request Flow (Student ขอลบ)

```
Student กดปุ่ม [ขอลบ] บนโพสต์ตัวเอง
  ↓
Modal: "เหตุผลที่ต้องการลบ" (optional text)
  ↓
กด [ส่งคำขอ]
  ↓
Update event doc:
  deleteRequested: true
  deleteRequestedBy: studentId
  deleteRequestedAt: now
  deleteRequestReason: "..."
  ↓
Admin เห็นใน Dashboard → "คำขอลบ" section
  ↓
Admin กด [อนุมัติ] → ลบ event + attachments จาก Storage
Admin กด [ปฏิเสธ] → reset deleteRequested = false
  ↓
(optional) แสดง badge "รอลบ" บน card ระหว่างรอ admin ตอบ
```

**Admin ลบโพสต์เอง:** ลบได้ทันทีโดยไม่ต้อง request (ทั้งของตัวเองและของ student)

---

## 9. Feature Detail: Multi-Image Upload + A4 Compression

### 9.1 Upload UX

```
┌─ Image Picker ────────────────────────┐
│                                       │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│  │ 📷  │ │ 📷  │ │ 📷  │ │  +  │    │
│  │ img1 │ │ img2 │ │ img3 │ │ เพิ่ม │    │
│  │  ✕   │ │  ✕   │ │  ✕   │ │     │    │
│  └─────┘ └─────┘ └─────┘ └─────┘    │
│                                       │
│  drag & drop หรือ click เพิ่มรูป       │
│  รองรับ jpg, png, webp | สูงสุด 20 รูป │
│                                       │
│  📊 กำลังบีบอัด... 3/5 (60%)          │
│  ████████░░░░░░                        │
└───────────────────────────────────────┘
```

- เลือกทีเดียวหลายรูป (`<input multiple accept="image/*">`)
- drag & drop zone
- preview thumbnail ก่อน upload
- ลบรูปออกได้ก่อนกด post
- progress bar แบบรวม (overall) + per-image status

### 9.2 Client-Side Compression Algorithm

ใช้ library: **browser-image-compression**

```typescript
import imageCompression from 'browser-image-compression';

// A4 at 150 DPI = 1240 x 1754 px (portrait)
// ใช้ด้านยาวสุด 1754px เป็น maxWidthOrHeight
const A4_MAX_DIMENSION = 1754;
const MAX_FILE_SIZE_MB = 2;

async function compressForUpload(file: File): Promise<File> {
  // ถ้าไฟล์เล็กกว่า A4 dimension → ไม่ resize แต่ยังอาจ compress quality
  const options = {
    maxSizeMB: MAX_FILE_SIZE_MB,
    maxWidthOrHeight: A4_MAX_DIMENSION,  // คงอัตราส่วน auto
    useWebWorker: true,
    fileType: 'image/jpeg',              // แปลงเป็น jpeg เสมอ (ลด size)
    initialQuality: 0.85,
  };

  const compressed = await imageCompression(file, options);
  return compressed;
}

// Flow:
// 1. User เลือกรูป 5 รูป
// 2. วน compress ทีละรูป (แสดง progress)
// 3. รูปไหนเล็กกว่า A4 → maxWidthOrHeight ไม่ resize แต่ยัง compress quality
// 4. รูปไหนใหญ่กว่า A4 → ย่อลงให้ด้านยาวสุด = 1754px คงอัตราส่วน
// 5. Upload ทั้งหมดแบบ parallel → Promise.all
```

### 9.3 Storage Path & Naming

```
projects/{projectId}/timeline/{eventId}/{uuid}.jpg
```

- ใช้ UUID เป็นชื่อไฟล์ (ป้องกัน collision)
- ทุกไฟล์แปลงเป็น `.jpg` หลัง compress
- max 20 รูปต่อ 1 event
- max 2MB ต่อรูป (หลัง compress)
- total per event: ~40MB worst case

---

## 10. Admin Analytics Dashboard

### 10.1 Filter System

| Filter       | ค่า                                        |
| ------------ | ------------------------------------------ |
| ช่วงเวลา     | เดือนนี้ / ปีนี้ / custom range (date picker) |
| ประเภทโครงงาน | ตาม category                                |
| สถานะ        | active / archived                           |

### 10.2 Stats Cards

| Card                    | Query Logic                                      |
| ----------------------- | ------------------------------------------------ |
| โครงงานทั้งหมด          | count `projects` where status = active            |
| ส่งแข่งแล้ว             | count timeline where type = submission (ในช่วงที่เลือก) |
| รอประกาศผล              | count timeline where type = result AND result = pending |
| ผ่าน / ได้รางวัล        | count timeline where result in [pass, award]      |
| เลย deadline            | deadline < today AND submissionStatus = draft     |
| คำขอลบรอดำเนินการ       | count timeline where deleteRequested = true       |

### 10.3 Charts

| Chart                    | ประเภท        |
| ------------------------ | ------------- |
| จำนวน event ต่อเดือน      | Bar Chart     |
| สัดส่วนผลลัพธ์            | Donut Chart   |
| โครงงานตาม category       | Pie Chart     |

### 10.4 Sections

- **Deadline Tracker:** sorted by date, color-coded (แดง < 3 วัน, เหลือง < 7 วัน, เขียว)
- **Activity Feed:** 20 events ล่าสุดจากทุก project
- **Delete Requests:** pending requests ที่รอ admin อนุมัติ

---

## 11. UI / UX Design — Liquid Glass

### 11.1 Design Tokens

```css
/* Liquid Glass Foundation */
--glass-bg: rgba(255, 255, 255, 0.45);
--glass-bg-hover: rgba(255, 255, 255, 0.6);
--glass-border: rgba(255, 255, 255, 0.3);
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
--glass-blur: blur(20px) saturate(180%);

/* Accent Colors */
--accent-blue: #007AFF;
--accent-green: #34C759;
--accent-red: #FF3B30;
--accent-yellow: #FFCC00;
--accent-purple: #AF52DE;
--accent-orange: #FF9500;

/* Typography */
--font-primary: "SF Pro Display", "Inter", system-ui, sans-serif;

/* Radius */
--radius-card: 20px;
--radius-button: 14px;
--radius-input: 12px;
--radius-pill: 999px;
```

### 11.2 Component Styles

**Glass Card:** backdrop-filter blur(20px), white overlay 45%, rounded 20px, subtle border + shadow

**Timeline Card:** glass card + left border 3px (สีตาม type) + relative time + type badge (pill)

**Stats Card:** glass card + large number (48px bold) + icon (accent color) + label

**Post Composer:** glass card + expand animation + sticky top on timeline page

**Image Grid:** masonry-like layout ใน card, click = lightbox zoom

**Delete Request Badge:** orange pill "รอลบ" บน card ที่ student ขอลบ

### 11.3 Responsive

- Desktop: 2-column charts, 4-column stats, sidebar nav
- Tablet: 2-column stats, stacked charts
- Mobile: single column, bottom nav, timeline แนวตั้ง

---

## 12. Portfolio Preview

### Route
```
/project/[id]/preview
```

### Structure
- **Header:** ชื่อโครงงาน, นักเรียน (ดึงจาก users), ครูที่ปรึกษา (ดึงจาก advisors)
- **Summary:** เวทีที่ส่ง + ผลลัพธ์ (จาก submission/result events)
- **Timeline:** เฉพาะ isHighlight = true, แสดงเป็นแนวตั้งสวยงาม

### Design Rules
- max-width: 800px, centered, พื้นขาว
- ไม่มี nav/footer/UI ที่ไม่จำเป็น
- ความยาวไม่เกิน 2 screen

---

## 13. Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isAdmin() {
      return request.auth.token.role == "admin";
    }

    function isProjectMember(projectId) {
      return request.auth.uid in
        get(/databases/$(database)/documents/projects/$(projectId)).data.studentIds;
    }

    // --- Users ---
    match /users/{userId} {
      allow read: if request.auth != null &&
        (isAdmin() || request.auth.uid == userId);
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        (isAdmin() || (request.auth.uid == userId
         && request.resource.data.role == resource.data.role));
        // student แก้ข้อมูลตัวเองได้ แต่ห้ามเปลี่ยน role
      allow delete: if isAdmin();
    }

    // --- Advisors ---
    match /advisors/{advisorId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // --- Projects ---
    match /projects/{projectId} {
      allow read: if request.auth != null &&
        (isAdmin() || request.auth.uid in resource.data.studentIds);
      allow create, update, delete: if isAdmin();
    }

    // --- Timeline Events ---
    match /projects/{projectId}/timeline/{eventId} {
      allow read: if request.auth != null &&
        (isAdmin() || isProjectMember(projectId));

      allow create: if request.auth != null &&
        (isAdmin() ||
         (isProjectMember(projectId)
          && request.resource.data.type == "progress"
          && request.resource.data.createdBy == request.auth.uid));

      // Student แก้ไขได้เฉพาะโพสต์ตัวเอง + เฉพาะ field ที่อนุญาต
      allow update: if request.auth != null &&
        (isAdmin() ||
         (isProjectMember(projectId)
          && resource.data.createdBy == request.auth.uid
          && resource.data.type == "progress"
          && request.resource.data.type == "progress"));
          // ป้องกัน student เปลี่ยน type เป็น result

      allow delete: if isAdmin();
    }

    // --- Invite Codes ---
    match /inviteCodes/{code} {
      allow read: if request.auth != null;
      allow create: if isAdmin();
      allow update: if request.auth != null
        && resource.data.used == false;
    }
  }
}
```

---

## 14. Firestore Indexes Required

```
// Collection Group: timeline
// สำหรับ admin dashboard
[createdAt ASC, type ASC]
[type ASC, deadline ASC]
[type ASC, result ASC, createdAt DESC]
[deleteRequested ASC, deleteRequestedAt DESC]   ← สำหรับ pending delete requests
```

---

## 15. Performance

- Timeline pagination: 50 events / page (`startAfter`)
- Image lazy load (Intersection Observer)
- ไม่ใช้ onSnapshot → `getDocs` + pull-to-refresh
- Firestore offline persistence: เปิด
- Image compression ฝั่ง client → ลด upload time + storage cost
- Next.js Server Components + client components เฉพาะที่จำเป็น

---

## 16. Development Phases

### Phase 1 — Foundation (สัปดาห์ 1-3)
- [ ] Firebase setup + Auth + Custom Claims
- [ ] Cloud Function: set admin role
- [ ] Data model: users, advisors, projects, timeline
- [ ] Invite code system
- [ ] User management CRUD (admin: students + advisors)
- [ ] Project CRUD (admin)
- [ ] Basic UI: glass cards, layout, responsive

### Phase 2 — Timeline & Posting (สัปดาห์ 4-5)
- [ ] Timeline view (Padlet-like)
- [ ] Post composer (text + multi-image + link + video link)
- [ ] Client-side image compression (A4 max)
- [ ] Parallel image upload + progress
- [ ] Edit post (own posts)
- [ ] Delete request flow (student request → admin approve)
- [ ] Flexible dates (nullable + add later)
- [ ] Admin: create submission/result events

### Phase 3 — Dashboard (สัปดาห์ 6-7)
- [ ] Admin dashboard: stats cards + filter
- [ ] Charts (Recharts)
- [ ] Deadline tracker
- [ ] Activity feed
- [ ] Delete request queue
- [ ] Archive project

### Phase 4 — Portfolio & Polish (สัปดาห์ 8)
- [ ] Portfolio preview page
- [ ] isHighlight toggle
- [ ] Print-friendly CSS
- [ ] Animations + liquid glass polish
- [ ] Testing + bug fix

---

## 17. Key Design Decisions

| Decision                              | เหตุผล                                               |
| ------------------------------------- | ---------------------------------------------------- |
| Advisors แยก collection               | reuse ข้าม project, ไม่ต้องมี account ในระบบ          |
| Padlet-like posting                   | ลด friction, ทุกคนโพสต์ได้ แต่ admin ยังคุมอยู่        |
| Delete request (ไม่ลบตรง)             | ป้องกัน student ลบข้อมูลสำคัญ                         |
| Nullable dates                        | สะท้อน real-world ที่ข้อมูลมาไม่ครบตั้งแต่แรก          |
| Client-side compress to A4 max        | ลด storage cost + upload time, คุณภาพเพียงพอสำหรับ print |
| Parallel upload                       | UX ดีกว่า sequential, ลด perceived wait time          |
| No video upload (link only)           | ประหยัด storage cost อย่างมาก                         |
| Timeline-centric (ยุบ submissions)    | Single source of truth                                |
| No realtime (onSnapshot)              | ลด complexity + cost                                  |
| No FCM push                           | ซับซ้อนเกินคุ้มสำหรับ solo dev                        |

---

## 18. Project Structure (Next.js App Router)

```
src/
  app/
    (auth)/
      login/page.tsx
      join/page.tsx                  ← student ใส่ invite code
    (dashboard)/
      admin/
        page.tsx                     ← admin dashboard + stats
        students/page.tsx            ← student management
        advisors/page.tsx            ← advisor management
        projects/
          new/page.tsx               ← create project form
          page.tsx                   ← project list
      student/
        page.tsx                     ← student dashboard
    project/
      [id]/
        page.tsx                     ← project detail + timeline + post composer
        edit/page.tsx                ← edit project (admin)
        preview/page.tsx             ← portfolio preview
  components/
    ui/                              ← GlassCard, Button, Input, Badge, Modal, etc.
    charts/                          ← StatsBarChart, ResultDonut, CategoryPie
    timeline/                        ← TimelineCard, PostComposer, ImageGrid
    dashboard/                       ← StatsCard, FilterBar, DeadlineTracker
    users/                           ← StudentTable, AdvisorTable, UserForm
    project/                         ← ProjectForm, AdvisorPicker, StudentPicker
  lib/
    firebase.ts
    auth.ts
    firestore.ts                     ← query helpers (CRUD for each collection)
    storage.ts                       ← upload + delete helpers
    compress.ts                      ← image compression logic
    utils.ts                         ← date formatting, relative time, etc.
  hooks/
    useAuth.ts
    useProject.ts
    useTimeline.ts
    useDashboardStats.ts
    useStudents.ts
    useAdvisors.ts
    useImageUpload.ts                ← multi-upload + compression + progress
    useDeleteRequest.ts
  types/
    index.ts                         ← User, Advisor, Project, TimelineEvent, Attachment, etc.
```

---

## 19. Future Improvements (ไม่อยู่ใน scope)

- Export PDF portfolio
- Analytics: year-over-year trends
- Tagging / labeling system
- Multi-school support
- Comment / reply บน timeline event (ถ้าต้องการ discussion)

---

# End of Document — V3
