# 🛡️ LifeVault

> **Card-Centric Personal Resource Hub & Real-Time Academic Command Center**  
> Transform chaotic "message-to-myself" chat dumps into an organized, topic-driven visual vault with real-time academic schedule tracking, offline-first resilience, and 1-tap PWA installation.

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-336791?style=for-the-badge&logo=postgresql)](https://supabase.com/)
[![NextAuth.js](https://img.shields.io/badge/Auth-NextAuth.js-purple?style=for-the-badge&logo=next.js)](https://next-auth.js.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline_Ready-5A0FC8?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 💡 The Problem & Motivation

Students, developers, and professionals routinely use **messaging apps ("Message Yourself" on WhatsApp / Telegram)** as their primary scratchpad. They dump lecture notes, assignment PDFs, YouTube tutorials, timetable screenshots, code snippets, and shopping wishlists all into one endless chat stream.

Over time, this results in:
* ❌ **The Linear Black Hole**: Important notes and attachments scroll far up into the chat history and are practically lost forever.
* ❌ **No Contextual Grouping**: Academic assignments, personal memes, and project documentation sit jumbled together.
* ❌ **Zero Schedule Intelligence**: Timetable screenshots must be searched for every morning, with no awareness of the current time or what class is happening now.
* ❌ **Cluttered Collaboration**: Sharing a specific lecture PDF or link requires forwarding through chat clutter.
* ❌ **Network Fragility**: Losing internet in the lecture hall or transit causes white screens, lost input drafts, and broken navigation.

**LifeVault** solves this by providing a clean, modern dashboard built around **Topic Cards** that each function like a dedicated, organized self-chat thread—paired with an automated **Real-Time Schedule Engine**, **offline-first resilience**, and **seamless multi-device synchronization**.

---

## ✨ Key Features

### 💬 1. Topic Cards as Self-Chat Threads
* **Dedicated Topic Channels**: Create cards for specific subjects (*e.g., Operating Systems, Web Development, Shopping Wishlist, DSA Prep*).
* **Linear Chronological Stream**: Clicking a card opens a modal presenting notes, hyperlinks, PDFs, images, and files in a clean, WhatsApp-style chronological feed.
* **Multi-Format Drop Bar**: Post quick notes, paste clickable URLs, or attach PDFs and images directly via the paperclip button.
* **Inline Message Editing**: Edit existing text notes or captions inline on the fly.
* **High-Res Lightbox**: View uploaded images uncropped with a built-in zoomable lightbox modal.
* **Client-Side Image Optimization**: High-resolution image attachments are automatically compressed client-side before upload to preserve bandwidth and storage.
* **Safe Local Draft Auto-Saving**: Unsent message inputs in card threads and new card creation forms are automatically saved to `localStorage`. Even if you switch tabs, close the browser, or lose internet connectivity, your drafts are securely preserved.
* **Public Card Sharing**: Generate one-click public shareable links (`/share/[token]`) to share lecture materials or notes with classmates without exposing the rest of your private vault.

### ⏱️ 2. Real-Time Smart Timetable Engine & High-Res Export
* **Dynamic Time Tracking**: Automatically detects the current day and minute, tracking the progress of your academic day.
* **Smart Status Banners**:
  * 🔴 **Live Class In Progress**: Prominently highlights the class happening right now with subject name, room, professor, and a live duration countdown meter.
  * ☕ **Break / Up Next**: Indicates free periods and counts down to the next scheduled lecture.
  * 🏁 **Day Complete**: Celebrates when all scheduled classes for the day have concluded.
* **Horizontal Left-to-Right Schedule Strip**: Classes are laid out in a compact horizontal scrollable strip with color-coded status badges (`LIVE NOW`, `NEXT`, `UPCOMING`, `COMPLETED`), saving valuable vertical screen space.
* **Timetable Manager**: Add, edit, or delete classes across all days (Monday–Saturday) with automatic chronological sorting.
* **Full-Week Schedule Modal**:
  * Clean, comprehensive horizontal day-by-day routine view (`Monday classes ->`, `Tuesday classes ->`, etc.).
  * Designed to be viewed in full on laptops and phones without awkward horizontal dragging.
* **2x Retina PNG Export & Print Support**:
  * Download your entire week's schedule as a crisp, high-resolution PNG image using `html-to-image`—ideal for phone lockscreens or desktop wallpapers.
  * Native print/PDF stylesheet for physical handouts or digital backups.

### 🎨 3. Five Dedicated Themes with Live Card Badges
Quickly filter and access resources across five distinct areas:
1. 📚 **Study** (`/theme/study`): Course textbooks, lecture slides, syllabus PDFs, and subject notes.
2. ⏳ **Study To-Do** (`/theme/study-to-do`): Pending homework, lab records, assignments, and problem sheets.
3. 📅 **Schedules** (`/theme/schedules`): Academic timelines, exam routines, and holiday calendars.
4. ✅ **To-Do** (`/theme/to-do`): Daily errands, shopping checklists, and personal tasks.
5. ✨ **Personal** (`/theme/personal`): Casual thoughts, interesting articles, memes, and bookmarks.
* **Live Theme Count Badges**: Both the top navbar (desktop) and bottom navigation bar (mobile) feature dynamic pill badges displaying exact card counts per category, updated in real time.

### 📶 4. Progressive Web App (PWA) & Offline-First Resilience
* **1-Tap Home Screen Installation**: Native Progressive Web App with Web Manifest (`manifest.json` + `manifest.ts`), high-resolution maskable app icons, and custom install banners for Chrome, Edge, Android, and iOS Safari.
* **Service Worker Caching (`sw.js`)**: Caches static assets, stylesheets, scripts, icons, and shell pages for instantaneous app launch even with zero internet connectivity.
* **Real-Time Offline Warning & Toast**: Live status banner detects network dropouts instantly, alerting the user and auto-dismissing when internet is restored.
* **Dedicated Offline Fallback Screen**: Reloading or navigating while offline gracefully renders a standalone, self-contained offline recovery page (`/offline` and `offline.html`) with 1-tap retry instead of a browser error.
* **Offline Mutation Safety**: Protects user data by preventing accidental deletions and incomplete file uploads while offline, keeping drafted text safe in local storage.

### 🔄 5. Zero-Cost Multi-Device Real-Time Sync
* Instant, automated synchronization across devices (laptop, tablet, phone) without relying on expensive paid WebSocket or Pusher subscriptions.
* Triggers smart silent background refreshes on window `focus`, browser `visibilitychange`, and periodic heartbeat pulses.

### 🔍 6. Universal Full-Text Search
* Real-time search indexing that queries across:
  * **Card Titles**
  * **Message / Note Contents**
  * **Link URLs**
  * **Uploaded File & Image Names**

### 📱 7. Mobile-First Responsive Experience
* **5-Theme Bottom Navigation**: 1-tap mobile navigation bar with dynamic theme accent highlighting and badge counters.
* **Touch-Friendly Controls**: Responsive timetable cards, optimized touch targets, swipe-friendly strips, and mobile-optimized chat thread drawers.

### 🔒 8. Multi-User Private Vaults & Authentication
* **100% Private Per-User Data Isolation**: Every registered user gets their own isolated vault. All cards, notes, attachments, and timetable routines are strictly filtered by `userId` at the database level.
* **Google OAuth 2.0 & Credentials Auth**: One-click "Continue with Google" sign-in via NextAuth, along with secure Email & Password registration with bcrypt hashing.
* **Secure JWT Sessions**: Authentication state is maintained via encrypted HTTP-only session cookies with automatic token renewal and expiration.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    Client["Client Browser / Mobile PWA"]
    
    subgraph PWA["PWA & Offline Layer"]
        SW["Service Worker (sw.js)"]
        Cache["Cache Storage (Static Shell & Assets)"]
        OfflineUI["Offline Notice & Fallback Page"]
        Drafts["localStorage (Safe Form Drafts)"]
    end

    subgraph Frontend["Next.js 14 App Router"]
        PageHome["Home Dashboard (/)"]
        PageTheme["Theme Pages (/theme/[theme])"]
        PageShare["Public Share Page (/share/[token])"]
        PageOffline["Offline Recovery Page (/offline)"]
        CardGrid["Card Grid & Live Preview"]
        ThreadModal["WhatsApp-Style Thread Modal"]
        ScheduleWidget["Real-Time Timetable & Export"]
        CardCounts["CardCountsProvider (Live Theme Badges)"]
        AuthContext["AuthProvider (NextAuth Session)"]
    end
    
    subgraph BackendAPI["Next.js API Route Handlers"]
        ApiCards["/api/cards & /api/cards/[id]"]
        ApiItems["/api/cards/[id]/items"]
        ApiTimetable["/api/timetable & /api/timetable/[id]"]
        ApiAuth["/api/auth/[...nextauth] & /api/auth/register"]
        ApiUpload["/api/upload & /uploads/[...path]"]
    end
    
    subgraph DatabaseLayer["Cloud Persistence"]
        Prisma["Prisma ORM Client"]
        Supabase["Supabase PostgreSQL (Connection Pooler)"]
    end

    Client --> SW
    SW --> Cache
    Client --> OfflineUI
    Client --> Drafts
    Client --> Frontend
    Frontend --> BackendAPI
    BackendAPI --> Prisma
    Prisma --> Supabase
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Server Components, Client Hydration, and API Route Handlers |
| **Language** | TypeScript 5.6 | Strict type-safety across frontend components, database queries, and API contracts |
| **Styling** | Tailwind CSS 3.4 | Modern glassmorphism, responsive mobile utilities, and dark mode theming |
| **PWA & Offline** | Service Worker + Manifest | Standalone mobile app installation, asset caching, and offline fallback |
| **Authentication** | NextAuth.js 4.24 + bcryptjs | Google OAuth 2.0 and secure Email/Password authentication with JWT sessions |
| **Database** | PostgreSQL (Supabase) | Production relational cloud database with connection pooling |
| **ORM** | Prisma 5.21 | Type-safe schema definition, relational cascading, and query building |
| **Image Export** | html-to-image 1.11 | High-fidelity client-side 2x Retina PNG rendering of full-week timetables |
| **Image Compression** | browser-image-compression | Client-side image optimization before upload to reduce payload sizes |
| **Icons** | Lucide React | Clean, scalable vector iconography |
| **Date Utilities** | date-fns 3.6 | Time parsing, duration calculation, and relative timestamps |
| **Deployment** | Render / Vercel | Production containerized cloud deployment with automated CI/CD |

---

## 📂 Project Structure

```text
resource-vault/
├── prisma/
│   ├── schema.prisma          # Database schema (User, Account, Card, CardItem, TimetableEntry)
│   └── seed.ts                # Database seeder script
├── public/
│   ├── icons/                 # PWA icons (192x192, 512x512, maskable, apple-touch)
│   ├── uploads/               # Uploaded media and documents storage
│   ├── favicon.png            # App favicon
│   ├── manifest.json          # Static Web App Manifest fallback
│   ├── offline.html           # Self-contained zero-dependency offline fallback screen
│   └── sw.js                  # Service Worker with runtime caching and offline interception
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/          # NextAuth route handler ([...nextauth]) and register endpoint
│   │   │   ├── cards/         # Card CRUD and nested item message handlers
│   │   │   ├── timetable/     # Timetable scheduling CRUD handlers
│   │   │   └── upload/        # File upload and streaming endpoints
│   │   ├── login/             # Sign-in and registration pages (Google & Credentials)
│   │   ├── offline/           # Dynamic offline fallback page route
│   │   ├── share/[token]/     # Public read-only card view for sharing
│   │   ├── theme/[theme]/     # Dynamic theme category pages (study, study-to-do, etc.)
│   │   ├── uploads/[...path]/ # Secure file delivery with MIME resolution
│   │   ├── globals.css        # Tailwind styles and glassmorphism definitions
│   │   ├── layout.tsx         # Root layout with AuthProvider, CardCountsProvider, and PWA setup
│   │   ├── manifest.ts        # Next.js dynamic Web App Manifest
│   │   └── page.tsx           # Main dashboard: Search, Timetable, Card Grid
│   ├── components/
│   │   ├── cards/             # CardGridItem, CardThreadModal, CreateCardModal, ShareCardModal
│   │   ├── dashboard/         # TodayScheduleWidget, WeeklyScheduleModal (PNG export)
│   │   ├── layout/            # Desktop Navbar & Mobile 5-Theme BottomNav (with count badges)
│   │   ├── providers/         # AuthProvider, CardCountsProvider, PwaProvider
│   │   └── ui/                # OfflineNotification, PwaInstallPrompt, ThemeToggle
│   ├── hooks/
│   │   └── useAdmin.tsx       # Auth status and permission hook
│   └── lib/
│       ├── auth.ts            # Authentication helper utilities
│       ├── authOptions.ts     # NextAuth provider configuration and callbacks
│       ├── compressImage.ts   # Client-side image compression utility
│       ├── db.ts              # Global Prisma Client instance
│       ├── session.ts         # User session extraction helper
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
* *(Optional)* Google Cloud Console OAuth 2.0 Credentials (for Google Sign-In)

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
Fill in your database connection string and session secrets:
```env
# Supabase PostgreSQL Pooler Connection URI (Port 5432 or 6543)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-secret-key-2026"

# Google OAuth 2.0 Credentials (Optional, from https://console.cloud.google.com)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
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
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Hashed password for credentials login
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  cards         Card[]
  timetable     TimetableEntry[]
}

model Card {
  id         String     @id @default(cuid())
  userId     String?
  user       User?      @relation(fields: [userId], references: [id], onDelete: Cascade)
  title      String     // Bold topic card title
  theme      String     // 'study' | 'study-to-do' | 'schedules' | 'to-do' | 'personal'
  isPinned   Boolean    @default(false)
  isPublic   Boolean    @default(false)
  shareToken String?    @unique
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
  items      CardItem[]
}

model CardItem {
  id        String   @id @default(cuid())
  cardId    String
  card      Card     @relation(fields: [cardId], references: [id], onDelete: Cascade)
  type      String   // 'text' | 'link' | 'image' | 'pdf' | 'file'
  content   String?  // Text content, note, or link URL
  filePath  String?  // Uploaded file path (/uploads/...)
  fileName  String?  // Original file name
  fileSize  Int?     // Size in bytes
  mimeType  String?  // MIME type
  createdAt DateTime @default(now())
}

model TimetableEntry {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: Cascade)
  dayOfWeek String   // 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  subject   String   // Course / Subject Name
  code      String?  // Course code e.g. 'CS401'
  startTime String   // e.g. '09:00 AM'
  endTime   String   // e.g. '10:00 AM'
  room      String?  // e.g. 'Room 302', 'Lab 2'
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
| `/api/cards` | `GET` | Authenticated | Fetch current user's cards (supports `?theme=` and `?search=`) |
| `/api/cards` | `POST` | Authenticated | Create a new topic card |
| `/api/cards/[id]` | `GET` | Authenticated / Public (if shared) | Fetch card details and its chronological items |
| `/api/cards/[id]` | `PATCH` | Authenticated | Update card title, theme, pinned status, or share token |
| `/api/cards/[id]` | `DELETE` | Authenticated | Delete a card and all associated messages/files |
| `/api/cards/[id]/items` | `POST` | Authenticated | Append a note, link, image, or document to a card |
| `/api/cards/[id]/items` | `PATCH` | Authenticated | Inline-edit an existing note or caption |
| `/api/cards/[id]/items` | `DELETE` | Authenticated | Delete a single item message from a card |
| `/api/timetable` | `GET` | Authenticated | Fetch user's timetable entries |
| `/api/timetable` | `POST` | Authenticated | Add a new class schedule entry |
| `/api/timetable/[id]` | `DELETE` | Authenticated | Delete a timetable entry |
| `/api/upload` | `POST` | Authenticated | Upload images, PDFs, and course documents |
| `/api/auth/[...nextauth]` | `GET` / `POST` | Public | NextAuth handler for Google OAuth and Credentials login/logout |
| `/api/auth/register` | `POST` | Public | Register a new user with email and hashed password |

---

## 📄 License & Intellectual Property

Copyright © 2026 Kanav Garg. All rights reserved.

This project is open for **personal, educational, and academic evaluation** purposes. Commercial use, monetization, redistribution, or publishing to public app stores (including the Google Play Store and Apple App Store) is strictly prohibited without prior written permission of the author. See [LICENSE](LICENSE) for full legal terms.
