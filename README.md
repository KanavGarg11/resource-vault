# 🛡️ LifeVault - Personal Resource Manager & Student Command Center

A modern, responsive, mobile-first web dashboard designed specifically to replace chaotic, linear **"WhatsApp message-to-myself"** chats.

---

## 🎯 Problems Solved

When saving everything to your own WhatsApp chat:
- ❌ **Linear Black Hole**: Important items scroll far up and get lost forever.
- ❌ **Zero Eye-Catching Urgency**: Assignments and to-dos don't trigger reminders when you just glance at them.
- ❌ **Mixed Clutter**: PDFs, memes, timetables, links, and exam dates are jumbled together.

### ✨ How LifeVault Solves This:
- ⚡ **Omni-Input "Quick Drop"**: A 1-tap mobile/desktop drop bar. Paste a link, drop a PDF, or type a reminder in 2 seconds—just like WhatsApp, but neatly categorized automatically!
- 📅 **Today's Timetable Widget**: Highlights today's routine (Mon–Fri) at a glance with class times, rooms, and professors.
- 🔥 **Urgent Deadlines Tracker**: Visual color-coded cards (🔥 Overdue, ⚠️ Due in < 48h, 📅 Upcoming) with countdown meters that immediately catch your eye.
- 🎓 **Exam Schedules & College Calendar**: Date-bound college notices (mid-terms, final exams, breaks) that stay visible until the date passes.
- 📚 **Study Vault**: Categorized by course (Operating Systems, Computer Networks, DBMS, Web Dev) with inline PDF preview and download.
- 🔗 **Smart Bookmarks**: Clean cards for college ERP, result portals, DSA sheets, and documentation with 1-click "Open" and "Copy Link".
- 🖼️ **Media Vault**: Visual gallery for memes, infographics, diagrams, and clips with a lightbox viewer and 1-click sharing.
- 🔒 **Public Read / Admin Write**:
  - Anyone with the link (classmates, friends, or yourself logged out) can freely view and download.
  - Unlock with your **Master PIN** (default: `1234`) on mobile or desktop to upload, edit, delete, or mark assignments done.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment & Admin PIN
Copy `.env.example` to `.env` if not already present:
```env
DATABASE_URL="file:./dev.db"
ADMIN_PIN="1106"
ADMIN_SESSION_SECRET="your-secret-key-student-hub-2026"
```
> Change `ADMIN_PIN` to whatever numeric code or password you prefer for your phone.

### 3. Initialize & Seed Database
```bash
# Push schema
npm run prisma:push

# Seed with starter timetable, study files, exams, and bookmarks
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Mobile Usage & Installation (PWA / Bookmark)
- **Open on Mobile**: Access your local IP (e.g. `http://192.168.x.x:3000`) or deploy to Vercel/Render.
- **Add to Home Screen**: In Chrome/Safari mobile, tap **Share / Menu $\to$ "Add to Home Screen"**. It opens like a native app with a bottom action bar and instant camera/file upload.

---

## 🌐 Deploying to the Cloud (Free Mobile Access Anywhere)

### Deploy to Vercel:
1. Push this repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com).
3. Set Environment Variables:
   - `ADMIN_PIN`: Your secret PIN
   - `ADMIN_SESSION_SECRET`: A random string
4. For persistent database in serverless environments, connect a free [Supabase](https://supabase.com) or [Neon PostgreSQL](https://neon.tech) database and update `DATABASE_URL` in Prisma schema!

---

## 🛠️ Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Custom Glassmorphism
- **Database**: SQLite + Prisma ORM
- **Icons**: Lucide Icons
- **Date Handling**: date-fns
- **Security**: Cryptographic HMAC session cookies with Master PIN protection
