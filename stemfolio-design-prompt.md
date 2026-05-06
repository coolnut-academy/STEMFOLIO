# STEMFOLIO-Inspired Webapp Design Prompt

เอกสารนี้สรุปแนวทางดีไซน์จากเว็บ `STEMFOLIO Web UI System` เพื่อใช้แนบให้ AI อ่านและปรับ webapp ให้มีสไตล์ใกล้เคียงกัน: dark sci-fi dashboard, glassmorphism, app shell, และ UI ที่ใช้งานจริง

## Design Direction

ปรับ webapp ให้เป็น **dark futuristic glassmorphism dashboard** ที่ดูเหมือนระบบ product จริง ไม่ใช่ landing page หรือหน้า marketing

บุคลิกของดีไซน์:

- Futuristic
- STEM / science / portfolio / analytics
- Premium แต่ยัง practical
- Clean, focused, dashboard-first
- Information dense แต่ไม่รก
- ใช้สี accent แบบ indigo, violet, purple, cyan, emerald

## Core Visual Keywords

- Dark sci-fi
- Glassmorphism
- App shell
- Sidebar navigation
- Frosted cards
- Soft glow
- Subtle star field
- Indigo-violet gradient
- Compact dashboard
- Rounded but structured
- High contrast text
- Muted metadata

## Color System

ใช้สีพื้นฐานประมาณนี้:

```css
:root {
  --background: #060918;
  --foreground: #eef2ff;

  --card: rgba(255, 255, 255, 0.06);
  --card-border: rgba(255, 255, 255, 0.08);
  --card-hover: rgba(255, 255, 255, 0.09);

  --input: rgba(255, 255, 255, 0.06);
  --input-border: rgba(255, 255, 255, 0.09);

  --primary: #6366f1;
  --accent: #8b5cf6;
  --purple: #a855f7;
  --cyan: #22d3ee;
  --success: #10b981;
  --warning: #f59e0b;
  --danger: #ef4444;

  --text-primary: #ffffff;
  --text-secondary: rgba(255, 255, 255, 0.65);
  --text-muted: rgba(255, 255, 255, 0.35);
  --text-faint: rgba(255, 255, 255, 0.22);
}
```

อย่าใช้สีเทาแบน ๆ เยอะ ให้ใช้ `white` พร้อม opacity แทน เช่น `white/65`, `white/35`, `white/22`

## Typography

ใช้ typography แนว tech/geometric:

- Brand / heading: `Exo 2`, fallback เป็น sans-serif
- Body: `DM Sans`, fallback เป็น system sans-serif
- Mono/data optional: `JetBrains Mono`

แนวทาง:

- Brand title ใช้ letter spacing กว้าง เช่น `0.18em` ถึง `0.2em`
- Heading ใช้ weight 600-800
- Metric numbers ใช้ weight 800
- Label ใช้ uppercase, font size 10px, letter spacing กว้าง
- Dashboard text ควรกระชับ ไม่ใช้ hero-size typography ใน card

ตัวอย่าง scale:

```css
.brand {
  font-family: "Exo 2", sans-serif;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 0.2em;
}

.app-title {
  font-family: "Exo 2", sans-serif;
  font-size: 1rem;
  font-weight: 600;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.body-small {
  font-size: 0.75rem;
}

.label {
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
```

## App Layout

ทำเป็น app shell:

- Sidebar ซ้ายกว้างประมาณ `240px`
- Topbar สูงประมาณ `64px`
- Main content scroll ได้
- Main padding ประมาณ `20px`
- Layout ใช้ grid responsive
- Desktop ใช้ 2-3 columns
- Mobile collapse เป็น single column หรือใช้ drawer/bottom nav

โครงหลัก:

```text
App
├─ Sidebar
│  ├─ Logo + Product Name
│  ├─ Navigation
│  └─ User Profile / Sign out
├─ Main Area
│  ├─ Topbar
│  │  ├─ Page title + subtitle
│  │  ├─ Search input
│  │  └─ Notification icon
│  └─ Scrollable Content
│     ├─ Welcome / Summary card
│     ├─ Metrics
│     ├─ Project / item cards
│     ├─ Charts
│     ├─ Activity feed
│     └─ CTA / preview cards
```

## Background Treatment

หน้า auth/login:

- ใช้พื้นหลัง `#060918`
- Center card
- เพิ่ม blurred glow ขนาดใหญ่ 2-3 จุด
- เพิ่ม star particles เล็ก ๆ สีขาว opacity ต่ำ
- หลีกเลี่ยง gradient สดเต็มหน้า

ตัวอย่าง:

```css
.auth-bg {
  min-height: 100vh;
  background: #060918;
  position: relative;
  overflow: hidden;
}

.glow-indigo {
  position: absolute;
  width: 540px;
  height: 540px;
  border-radius: 999px;
  background: rgba(67, 56, 202, 0.13);
  filter: blur(130px);
}

.glow-violet {
  position: absolute;
  width: 440px;
  height: 440px;
  border-radius: 999px;
  background: rgba(109, 40, 217, 0.13);
  filter: blur(110px);
}
```

## Glass Card

ใช้ card style นี้เป็นพื้นฐาน:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.35);
}

.glass-card.clickable {
  cursor: pointer;
  transition: background 200ms ease, transform 200ms ease;
}

.glass-card.clickable:hover {
  background: rgba(255, 255, 255, 0.09);
  transform: translateX(2px);
}
```

## Sidebar

Sidebar ควรนิ่ง เรียบ และใช้งานซ้ำได้:

```css
.sidebar {
  width: 240px;
  height: 100vh;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.025);
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(40px);
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  transition: all 150ms ease;
}

.nav-item:hover {
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.04);
}

.nav-item.active {
  color: #c7d2fe;
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.15);
}
```

## Topbar

Topbar:

- สูง `64px`
- border-bottom บาง ๆ
- background โปร่งมาก
- มี title, subtitle, search, notification

```css
.topbar {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: rgba(255, 255, 255, 0.015);
  backdrop-filter: blur(24px);
}
```

## Buttons

Primary button:

```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
  padding: 14px 18px;
  color: white;
  font-weight: 700;
  background: linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7);
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
  transition: all 300ms ease;
}

.btn-primary:hover {
  filter: brightness(1.1);
}
```

Glass button:

```css
.btn-glass {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 12px;
  padding: 10px 14px;
  color: white;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  transition: all 200ms ease;
}

.btn-glass:hover {
  background: rgba(255, 255, 255, 0.11);
}
```

## Inputs

```css
.input {
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  padding: 12px 16px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  backdrop-filter: blur(8px);
  transition: all 200ms ease;
}

.input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.input:focus {
  outline: none;
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.25);
}
```

## Badges

ใช้ badge เป็น rounded-full เล็ก ๆ:

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
}

.badge-indigo {
  color: #c7d2fe;
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.badge-emerald {
  color: #6ee7b7;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.badge-amber {
  color: #fcd34d;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.25);
}
```

## Dashboard Components

ควรมี component pattern ต่อไปนี้:

### Welcome Summary Card

- Glass card
- Gradient overlay จาง ๆ จาก indigo ไป transparent
- มี heading เช่น “Good morning, Mia!”
- มี subtitle
- มี metric 3 ค่าเรียงด้านขวาหรือด้านล่าง

### Metric Cards

- ตัวเลขใหญ่ สี accent
- label เล็ก muted
- icon ขนาด 15-18px
- optional change pill เช่น `+12`

### Project / Entity Cards

โครง:

```text
[Icon square]  Title                         [Status] [Phase]
               Category · members
               Short description
               [progress bar]  75%  2h ago
```

รายละเอียด:

- Icon square 44px, radius 12px
- Background icon เป็น accent transparent เช่น indigo/15
- Border icon เป็น accent/25
- Description line clamp 1-2 บรรทัด
- Progress bar สูง 6px
- Timestamp สี faint

### Chart Cards

- ใช้ line/bar/donut chart สี indigo, violet, cyan, emerald
- Axis labels สีขาว opacity 28-30%
- Tooltip dark glass:
  - background `rgba(10,15,45,0.95)`
  - border `rgba(255,255,255,0.1)`
  - border radius 10px

### Activity Feed

- ใช้ avatar initials เป็นวงกลม
- ชื่อ user เป็น white/85
- action text white/65
- time white/22
- item spacing ประมาณ 12px

### CTA / Preview Card

- Glass card
- เพิ่ม gradient overlay จาง ๆ จาก violet/indigo
- มี icon + title + short description + action link
- Action link เป็น violet text พร้อม chevron

## Auth / Login Page

หน้า login ควรมี:

- Logo square 68px
- Logo gradient `indigo -> violet -> purple`
- Shadow glow indigo
- Brand title letter spacing กว้าง
- Subtitle muted
- Login card max-width ประมาณ 384px
- Role segmented control เช่น Student / Administrator
- Email/password input พร้อม icon
- Remember me + forgot password
- Launch button gradient
- Loading state “Launching…” พร้อม spinner

Login card:

```css
.login-card {
  width: 100%;
  max-width: 384px;
  background: rgba(255, 255, 255, 0.065);
  backdrop-filter: blur(40px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 24px 72px rgba(0, 0, 0, 0.55);
}
```

## Icons

ใช้ icon outline เช่น `lucide-react`

ขนาดแนะนำ:

- Logo auth: 30px
- Logo sidebar: 15px
- Nav icon: 15px
- Search/notification: 14-16px
- Card icon: 20-24px
- Button icon: 13-15px

อย่าวาด icon เองถ้ามี icon library อยู่แล้ว

## Motion

ใช้ motion แบบ subtle:

- Transition 150-300ms
- Button hover brightens slightly
- Glass card hover background เพิ่มเล็กน้อย
- Clickable card translate 1-2px
- Loading spinner ในปุ่ม
- Active navigation เปลี่ยน background/border/color

อย่าใส่ animation เยอะจนดูเป็นเกมหรือ landing page

## Responsive Rules

Desktop:

- Sidebar fixed 240px
- Main content multi-column
- Topbar มี search ด้านขวา

Tablet:

- ลด grid เป็น 1-2 columns
- ลด padding card เหลือ 16px

Mobile:

- Single column
- Sidebar เป็น drawer หรือ bottom nav
- Login card max-width `calc(100% - 32px)`
- ป้องกัน text overflow ทุก card/button

## Do

- ทำให้ UI เหมือน dashboard product จริง
- ใช้ app shell เป็นโครงหลัก
- ใช้ card โปร่งแสงและ border บาง
- ใช้ accent สี indigo/violet อย่างสม่ำเสมอ
- ใช้สีขาว opacity สำหรับ text hierarchy
- ใช้ spacing กระชับ
- ใช้ chart/list/card เพื่อให้ข้อมูล scan ง่าย
- ให้ทุก state ดูครบ: hover, active, focus, disabled, loading

## Don't

- อย่าทำเป็น landing page marketing
- อย่าใช้ hero ใหญ่กินจอใน dashboard
- อย่าใช้ gradient สดเต็มพื้นหลัง
- อย่าใช้สีม่วงทั้งหน้าโดยไม่มี contrast
- อย่าใช้ card ซ้อน card หนัก ๆ
- อย่าใช้ text ใหญ่เกินบริบท dashboard
- อย่าใส่คำอธิบายวิธีใช้ UI บนหน้าจอมากเกินไป
- อย่าเปลี่ยน functionality เดิมถ้าไม่ได้ขอ

## Copy-Paste Prompt For AI

```text
ปรับ UI ของ webapp นี้ให้เป็นสไตล์ dark futuristic glassmorphism dashboard คล้าย STEMFOLIO Web UI System

เป้าหมาย:
- ทำให้หน้าทั้งหมดดูเป็น webapp product จริง ไม่ใช่ landing page
- รักษา functionality และ data flow เดิมไว้
- ปรับ visual system, layout, spacing, component states, navigation, cards, forms, buttons, badges และ charts ให้สอดคล้องกันทั้งระบบ

Design direction:
- Dark sci-fi dashboard
- Glassmorphism
- App shell with sidebar + topbar + scrollable main content
- Premium, clean, compact, information dense but readable
- STEM / analytics / portfolio mood

Colors:
- Background: #060918
- Text primary: #ffffff
- Text default: #eef2ff
- Muted text: rgba(255,255,255,0.35)
- Card: rgba(255,255,255,0.06)
- Card border: rgba(255,255,255,0.08)
- Primary: #6366f1
- Accent: #8b5cf6
- Purple: #a855f7
- Cyan: #22d3ee
- Success: #10b981
- Warning: #f59e0b
- Danger: #ef4444

Typography:
- Use Exo 2 or similar geometric tech font for brand/headings
- Use DM Sans or clean sans-serif for body
- Brand text should have wide letter spacing
- Dashboard headings should be compact
- Metrics should be bold and high contrast
- Labels should be uppercase, tiny, and letter-spaced

Layout:
- Desktop app shell with 240px left sidebar
- 64px topbar with page title, subtitle, search, notification icon
- Main content padding around 20px
- Use responsive grid: 2-3 columns on desktop, 1 column on mobile
- Avoid marketing hero sections

Components:
- Glass cards with rgba white background, backdrop blur, subtle border, radius 16px, deep shadow
- Sidebar nav items with icon + label; active item has indigo translucent background and border
- Buttons:
  - Primary gradient from indigo to violet to purple
  - Glass secondary button with translucent background
  - Ghost button for low-priority actions
- Inputs with translucent background, icon support, clear focus ring in indigo
- Badges/status pills with subtle colored background and border
- Project/list cards with icon square, status badges, description, progress bar, and timestamp
- Activity feed with initials avatars
- Chart cards with indigo/violet/cyan accents and dark glass tooltip
- CTA cards with subtle violet/indigo overlay

Background:
- Use #060918
- Add large blurred glow spots in indigo/violet/cyan with low opacity
- For login/auth page, add subtle star particles
- Do not use loud full-page gradients

Interaction:
- Add hover/focus/active states everywhere
- Use transition 150-300ms
- Clickable cards can move 1-2px
- Buttons brighten slightly on hover
- Loading states should show spinner and text

Responsive:
- On mobile, collapse grids to one column
- Sidebar should become drawer or bottom nav
- Ensure text never overflows buttons/cards
- Keep spacing compact but breathable

Important constraints:
- Preserve the existing app logic and routes
- Do not remove features
- Do not add large marketing copy
- Do not overdecorate
- Make the design consistent across all screens
```

