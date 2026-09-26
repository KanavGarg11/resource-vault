# 🛡️ LifeVault

> **Card-Centric Personal Resource Hub & Real-Time Student Command Center**  
> Designed to transform chaotic "WhatsApp message-to-myself" chats into an organized, topic-driven visual vault with real-time academic schedule tracking.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)](https://supabase.com/)

---

## 💡 The Problem & Motivation

Students and developers routinely use **messaging apps ("Message Yourself" / WhatsApp self-chats)** as their primary scratchpad. They dump lecture notes, assignment PDFs, YouTube tutorials, timetable screenshots, code snippets, and shopping wishlists all into one place.

Over time, this results in:
* ❌ **The Linear Black Hole**: Important notes and attachments scroll far up into the chat history and are practically lost forever.
* ❌ **No Contextual Grouping**: Academic assignments, personal memes, and project documentation sit jumbled together.
* ❌ **Zero Schedule Intelligence**: Timetable screenshots must be searched for every morning, with no awareness of the current time or what class is happening now.
* ❌ **Cluttered Collaboration**: Sharing a specific lecture PDF or link requires forwarding through chat clutter.

**LifeVault** solves this by providing a clean, modern dashboard built around **Topic Cards** that each function like a dedicated, organized self-chat thread—paired with an automated **Real-Time Schedule Engine**.

---

## ✨ Key Features

### 💬 1. Topic Cards as Self-Chat Threads
* **Dedicated Topic Channels**: Create cards for specific subjects (*e.g., Operating Systems, Web Development, Shopping Wishlist, DSA Prep*).
* **Linear Chronological Stream**: Clicking a card opens a modal presenting notes, hyperlinks, PDFs, images, and files in a clean, WhatsApp-style chronological feed.
* **Multi-Format Drop Bar**: Post quick notes, paste clickable URLs, or attach PDFs and images directly via the paperclip button.
* **Inline Message Editing**: Edit existing text notes or captions inline on the fly.
* **High-Res Lightbox**: View uploaded images uncropped with a built-in zoomable lightbox modal.
* **Card Preview**: Grid cards feature a bottom-up message preview that shows latest entries at a glance.

### ⏱️ 2. Real-Time Smart Timetable Engine
* **Dynamic Time Tracking**: Automatically detects the current day and minute, tracking the progress of your academic day.
* **Smart Status Banners**:
  * 🔴 **Live Class In Progress**: Prominently highlights the class happening right now with subject name, room, professor, and a live duration countdown meter.
  * ☕ **Break / Up Next**: Indicates free periods and counts down to the next scheduled lecture.
  * 🏁 **Day Complete**: Celebrates when all scheduled classes for the day have concluded.
* **Horizontal Left-to-Right Schedule Strip**: Classes are laid out in a compact horizontal scrollable strip with color-coded status badges (`LIVE NOW`, `NEXT`, `UPCOMING`, `COMPLETED`), saving valuable vertical screen space.
* **Timetable Manager**: Add, edit, or delete classes across all days (Monday–Saturday) with automatic chronological sorting.

### 🎨 3. Five Dedicated Categorical Themes
Quickly filter and access resources across five distinct areas:
1. 📚 **Study** (`/theme/study`): Course textbooks, lecture slides, syllabus PDFs, and subject notes.
2. ⏳ **Study To-Do** (`/theme/study-to-do`): Pending homework, lab records, assignments, and problem sheets.
3. 📅 **Schedules** (`/theme/schedules`): Academic timelines, exam routines, and holiday calendars.
4. ✅ **To-Do** (`/theme/to-do`): Daily errands, shopping checklists, and personal tasks.
5. ✨ **Personal** (`/theme/personal`): Casual thoughts, interesting articles, memes, and bookmarks.

### 🔍 4. Universal Full-Text Search
* Real-time search indexing that queries across:
  * **Card Titles**
  * **Message / Note Contents**
  * **Link URLs**
  * **Uploaded File & Image Names**

### 📱 5. Mobile-First Experience
* **5-Theme Bottom Navigation**: 1-tap mobile navigation bar with dynamic theme accent highlighting.
* **Touch-Friendly Controls**: On-screen keypad for PIN entry, swipe-friendly horizontal timetable strip, and responsive chat modal.

### 🔒 6. Multi-User Private Vaults & Authentication
* **100% Private Per-User Data Isolation**: Every registered user gets their own dedicated vault. All cards, notes, attachments, and timetable routines are strictly filtered by `userId` at the database level. No user can view, edit, or delete another user's resources.
* **Google OAuth 2.0 & Email Authentication**: One-click "Continue with Google" sign-in via NextAuth, along with secure Email & Password registration with bcrypt hashing.
* **Secure JWT Sessions**: Authentication state is maintained via encrypted HTTP-only session cookies with automatic token renewal and expiration.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client["Client Browser / Mobile PWA"]
    
    subgraph Frontend["Next.js 14 App Router"]
        PageHome["Home Dashboard (/)"]
        PageTheme["Theme Pages (/theme/[theme])"]
        CardGrid["Card Grid & Live Preview"]
        ThreadModal["WhatsApp-Style Thread Modal"]
        ScheduleWidget["Real-Time Timetable Widget"]
        AdminAuth["Admin PIN Auth Context"]
    end
    
    subgraph BackendAPI["Next.js API Route Handlers"]
        ApiCards["/api/cards & /api/cards/[id]"]
        ApiItems["/api/cards/[id]/items"]
        ApiTimetable["/api/timetable & /api/timetable/[id]"]
        ApiAuth["/api/auth (login, logout, status)"]
        ApiUpload["/api/upload & /uploads/[...path]"]
    end
    
    subgraph DatabaseLayer["Cloud Persistence"]
        Prisma["Prisma ORM Client"]
        Supabase["Supabase PostgreSQL (Connection Pooler)"]
    end

    Client --> Frontend
    Frontend --> BackendAPI
    BackendAPI --> Prisma
    Prisma --> Supabase
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Server-side rendering, React Server Components, and API Route Handlers |
| **Language** | TypeScript 5.6 | Strict type-safety across frontend components and backend payloads |
| **Styling** | Tailwind CSS 3.4 | Modern glassmorphism, responsive utilities, and dark mode support |
| **Database** | PostgreSQL (Supabase) | Production relational cloud database with connection pooling |
| **ORM** | Prisma 5.22 | Type-safe schema definition, relational cascading, and query building |
| **Icons** | Lucide React | Clean, scalable vector iconography |
| **Date Utilities** | date-fns 3.6 | Time parsing, duration calculation, and relative timestamps |
| **Deployment** | Render / Vercel | Production containerized cloud deployment with automated CI/CD |

---

## 📂 Project Structure

```text
resource-vault/
├── prisma/
│   ├── schema.prisma          # Database schema (Card, CardItem, TimetableEntry)
│   └── seed.ts                # Database seeder script
├── public/
│   ├── uploads/               # Uploaded media and documents storage
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # Login, logout, session status endpoints
│   │   │   ├── cards/         # Card CRUD and nested item message handlers
│   │   │   ├── timetable/     # Timetable scheduling CRUD handlers
│   │   │   └── upload/        # File upload and streaming endpoints
│   │   ├── theme/[theme]/     # Dynamic theme category pages
│   │   ├── uploads/[...path]/ # Secure file delivery with MIME resolution
│   │   ├── globals.css        # Tailwind styles and glassmorphism definitions
│   │   ├── layout.tsx         # Root layout with Admin Provider & Navbar
│   │   └── page.tsx           # Main dashboard: Search, Timetable, Card Grid
│   ├── components/
│   │   ├── cards/             # CardGridItem, CardThreadModal, CreateCardModal
│   │   ├── dashboard/         # TodayScheduleWidget (Real-time tracking engine)
│   │   ├── layout/            # Desktop Navbar & Mobile 5-Theme BottomNav
│   │   └── ui/                # AdminPinModal, ThemeToggle
│   ├── hooks/
│   │   └── useAdmin.tsx       # Admin authentication context hook
│   └── lib/
│       ├── auth.ts            # Cryptographic HMAC session generation & PIN hash
│       ├── db.ts              # Global Prisma Client instance
│       └── types.ts           # Shared TypeScript interfaces & theme configs
├── .env.example               # Example environment variables
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## ⚡ Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18.17.0 or later)
* [npm](https://www.npmjs.com/) (v9 or later)
* A PostgreSQL database (e.g., [Supabase](https://supabase.com), [Neon](https://neon.tech), or local PostgreSQL)

### 1. Clone the Repository
```bash
git clone https://github.com/KanavGarg11/resource-vault.git
cd resource-vault
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your database connection string and session secret:
```env
# Supabase PostgreSQL Pooler Connection URI (Port 5432 or 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Secret key used for signing cryptographic HMAC admin session tokens
ADMIN_SESSION_SECRET="your-secure-random-secret-key-2026"

# Optional: Master Admin PIN (Defaults to secure hash if not specified)
ADMIN_PIN="1106"
```

### 4. Push Database Schema
Apply the Prisma schema to your PostgreSQL database:
```bash
npm run prisma:push
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production
```bash
npm run build
npm start
```

---

## 🗄️ Database Schema Overview

```prisma
model Card {
  id        String     @id @default(cuid())
  title     String
  theme     String     // 'study' | 'study-to-do' | 'schedules' | 'to-do' | 'personal'
  isPinned  Boolean    @default(false)
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  items     CardItem[]
}

model CardItem {
  id        String   @id @default(cuid())
  cardId    String
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  type      String   // 'text' | 'link' | 'image' | 'pdf' | 'file'
  content   String?  // Text content, note, or link URL
  filePath  String?  // Uploaded file path
  fileName  String?  // Original file name
  fileSize  Int?     // Size in bytes
  mimeType  String?  // MIME type
  createdAt DateTime @default(now())
}

model TimetableEntry {
  id        String   @id @default(cuid())
  dayOfWeek String   // 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'
  subject   String   // Course / Subject Name
  code      String?  // Course code (e.g. 'CS401')
  startTime String   // e.g. '09:00 AM'
  endTime   String   // e.g. '10:00 AM'
  room      String?  // e.g. 'Room 302'
  professor String?  // e.g. 'Dr. Rao'
  order     Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## 🌐 API Reference

| Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- |
| `/api/cards` | `GET` | Public | Fetch cards (supports `?theme=` and `?search=`) |
| `/api/cards` | `POST` | Admin | Create a new topic card |
| `/api/cards/[id]` | `GET` | Public | Fetch card details and its chronological items |
| `/api/cards/[id]` | `PATCH` | Admin | Update card title, theme, or pinned status |
| `/api/cards/[id]` | `DELETE` | Admin | Delete a card and all associated messages/files |
| `/api/cards/[id]/items` | `POST` | Admin | Append a note, link, image, or document to a card |
| `/api/cards/[id]/items` | `PATCH` | Admin | Inline-edit an existing note or caption |
| `/api/cards/[id]/items` | `DELETE` | Admin | Delete a single item message from a card |
| `/api/timetable` | `GET` | Public | Fetch timetable entries |
| `/api/timetable` | `POST` | Admin | Add a new class schedule entry |
| `/api/timetable/[id]` | `DELETE` | Admin | Delete a timetable entry |
| `/api/upload` | `POST` | Admin | Upload images, PDFs, and course documents |
| `/api/auth/login` | `POST` | Public | Verify PIN and issue secure HMAC session cookie |
| `/api/auth/logout` | `POST` | Public | Clear admin session cookie |
| `/api/auth/status` | `GET` | Public | Check current admin authorization status |

---

## 📄 License & Intellectual Property

Copyright © 2026 Kanav Garg. All rights reserved.

This project is open for **personal, educational, and academic evaluation** purposes. Commercial use, monetization, redistribution, or publishing to public app stores (including the Google Play Store and Apple App Store) is strictly prohibited without prior written permission of the author. See [LICENSE](LICENSE) for full legal terms.
