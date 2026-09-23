import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing
  await prisma.resource.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.academicEvent.deleteMany();
  await prisma.subject.deleteMany();

  // Subjects
  await prisma.subject.createMany({
    data: [
      { name: "Operating Systems", code: "CS301", color: "indigo", semester: "Sem 5" },
      { name: "Computer Networks", code: "CS302", color: "emerald", semester: "Sem 5" },
      { name: "Database Management", code: "CS303", color: "amber", semester: "Sem 5" },
      { name: "Web Development", code: "CS304", color: "sky", semester: "Sem 5" },
      { name: "Design & Analysis of Algo", code: "CS305", color: "rose", semester: "Sem 5" },
    ],
  });

  // Timetable
  await prisma.timetableEntry.createMany({
    data: [
      // Monday
      { dayOfWeek: "Monday", startTime: "09:00 AM", endTime: "10:00 AM", subject: "Operating Systems", code: "CS301", room: "Room 302", professor: "Dr. Rao" },
      { dayOfWeek: "Monday", startTime: "10:15 AM", endTime: "11:15 AM", subject: "Computer Networks", code: "CS302", room: "Room 302", professor: "Prof. Ananya" },
      { dayOfWeek: "Monday", startTime: "11:30 AM", endTime: "01:30 PM", subject: "Web Development Lab", code: "CS304L", room: "Computer Lab 4", professor: "Er. Verma" },
      { dayOfWeek: "Monday", startTime: "02:30 PM", endTime: "03:30 PM", subject: "Database Management", code: "CS303", room: "Room 305", professor: "Dr. Kulkarni" },

      // Tuesday
      { dayOfWeek: "Tuesday", startTime: "09:00 AM", endTime: "10:00 AM", subject: "Design & Analysis of Algo", code: "CS305", room: "Room 302", professor: "Dr. Mehta" },
      { dayOfWeek: "Tuesday", startTime: "10:15 AM", endTime: "11:15 AM", subject: "Operating Systems", code: "CS301", room: "Room 302", professor: "Dr. Rao" },
      { dayOfWeek: "Tuesday", startTime: "11:30 AM", endTime: "01:30 PM", subject: "OS & Shell Scripting Lab", code: "CS301L", room: "Computer Lab 2", professor: "Dr. Rao" },

      // Wednesday
      { dayOfWeek: "Wednesday", startTime: "09:00 AM", endTime: "10:00 AM", subject: "Computer Networks", code: "CS302", room: "Room 302", professor: "Prof. Ananya" },
      { dayOfWeek: "Wednesday", startTime: "10:15 AM", endTime: "11:15 AM", subject: "Database Management", code: "CS303", room: "Room 305", professor: "Dr. Kulkarni" },
      { dayOfWeek: "Wednesday", startTime: "11:30 AM", endTime: "12:30 PM", subject: "Web Development", code: "CS304", room: "Room 302", professor: "Er. Verma" },
      { dayOfWeek: "Wednesday", startTime: "01:30 PM", endTime: "03:30 PM", subject: "DBMS Lab", code: "CS303L", room: "Computer Lab 3", professor: "Dr. Kulkarni" },

      // Thursday
      { dayOfWeek: "Thursday", startTime: "09:00 AM", endTime: "10:00 AM", subject: "Design & Analysis of Algo", code: "CS305", room: "Room 302", professor: "Dr. Mehta" },
      { dayOfWeek: "Thursday", startTime: "10:15 AM", endTime: "11:15 AM", subject: "Web Development", code: "CS304", room: "Room 302", professor: "Er. Verma" },
      { dayOfWeek: "Thursday", startTime: "11:30 AM", endTime: "12:30 PM", subject: "Computer Networks", code: "CS302", room: "Room 302", professor: "Prof. Ananya" },

      // Friday
      { dayOfWeek: "Friday", startTime: "09:00 AM", endTime: "10:00 AM", subject: "Operating Systems", code: "CS301", room: "Room 302", professor: "Dr. Rao" },
      { dayOfWeek: "Friday", startTime: "10:15 AM", endTime: "11:15 AM", subject: "Database Management", code: "CS303", room: "Room 305", professor: "Dr. Kulkarni" },
      { dayOfWeek: "Friday", startTime: "11:30 AM", endTime: "01:30 PM", subject: "Project & Seminar Session", code: "CS306", room: "Seminar Hall A", professor: "HOD Dept." },
    ],
  });

  // Academic Events / Exams
  const now = new Date();
  const examStart = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const examEnd = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000);
  const holidayStart = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
  const holidayEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.academicEvent.createMany({
    data: [
      {
        title: "Mid-Semester Theory Examinations (Sem 5)",
        eventType: "exam",
        startDate: examStart,
        endDate: examEnd,
        description: "Official mid-term examination covering Units 1, 2, and 3. Hall tickets will be issued 3 days prior.",
      },
      {
        title: "College Diwali & Mid-Term Festival Break",
        eventType: "holiday",
        startDate: holidayStart,
        endDate: holidayEnd,
        description: "College campus closed for students. Online portal remains accessible.",
      },
      {
        title: "Semester Project Synopsis Submission Deadline",
        eventType: "deadline",
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        description: "Submit 2-page project proposal signed by guide to department office.",
      },
    ],
  });

  // Resources (Study files, assignments, to-dos, links, media)
  const dueTomorrow = new Date(now.getTime() + 1.5 * 24 * 60 * 60 * 1000);
  const dueInFourDays = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
  const dueNextWeek = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);

  await prisma.resource.createMany({
    data: [
      // Assignments
      {
        title: "Web Dev: Build REST API & Full-Stack Auth",
        description: "Implement JWT or session authentication with role-based access for the course mini project. Push code to GitHub and submit repository link.",
        type: "assignment",
        category: "Web Development",
        semester: "Sem 5",
        dueDate: dueTomorrow,
        status: "pending",
        priority: "urgent",
        tags: "Assignment 3,Mini Project,GitHub",
        isPinned: true,
      },
      {
        title: "DBMS Lab 4: Complex Joins, Triggers & Procedures",
        description: "Write queries for banking database schema given in Question Sheet 4. Test on PostgreSQL / Oracle and screenshot outputs.",
        type: "assignment",
        category: "Database Management",
        semester: "Sem 5",
        dueDate: dueInFourDays,
        status: "in-progress",
        priority: "high",
        tags: "Lab Record,SQL,Triggers",
        isPinned: true,
      },
      {
        title: "OS Shell Scripting: Process Monitor & File Backup",
        description: "Write bash script that checks CPU load, logs alerts, and schedules automated tar gz backup.",
        type: "assignment",
        category: "Operating Systems",
        semester: "Sem 5",
        dueDate: dueNextWeek,
        status: "pending",
        priority: "normal",
        tags: "Bash,Linux,Assignment 2",
        isPinned: false,
      },

      // Study Files / Docs
      {
        title: "OS Unit 2: CPU Scheduling & Synchronization Complete Notes",
        description: "Comprehensive lecture handwritten notes covering FCFS, Round Robin, Semaphores, Mutex, and Peterson's Algorithm with solved numericals.",
        type: "study",
        category: "Operating Systems",
        semester: "Sem 5",
        fileName: "OS_Unit2_Synchronization_Notes.pdf",
        filePath: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileSize: 4200000,
        mimeType: "application/pdf",
        tags: "Lecture Notes,Unit 2,Semaphores,Important",
        isPinned: true,
      },
      {
        title: "Computer Networks: Last 5 Years Solved Question Papers",
        description: "Compiled university previous year exam questions (PYQ) with model answer keys covering OSI model, TCP/IP, Subnetting.",
        type: "study",
        category: "Computer Networks",
        semester: "Sem 5",
        fileName: "CN_Solved_PYQ_2020_2025.pdf",
        filePath: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileSize: 8900000,
        mimeType: "application/pdf",
        tags: "PYQ,Exam Prep,Subnetting",
        isPinned: false,
      },
      {
        title: "DBMS: Normalization & SQL Queries Master Cheat Sheet",
        description: "Quick reference guide for 1NF, 2NF, 3NF, BCNF dependency preservation and tricky SQL join patterns.",
        type: "study",
        category: "Database Management",
        semester: "Sem 5",
        fileName: "DBMS_CheatSheet_Normalization.pdf",
        filePath: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileSize: 2100000,
        mimeType: "application/pdf",
        tags: "Cheat Sheet,Normalization,SQL",
        isPinned: false,
      },
      {
        title: "DAA: Dynamic Programming Master Pattern Sheet",
        description: "0/1 Knapsack, Longest Common Subsequence, Matrix Chain Multiplication step-by-step state diagrams.",
        type: "study",
        category: "Design & Analysis of Algo",
        semester: "Sem 5",
        fileName: "DAA_Dynamic_Programming.pdf",
        filePath: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
        fileSize: 3400000,
        mimeType: "application/pdf",
        tags: "Algorithms,DP,Reference",
        isPinned: false,
      },

      // Links & Bookmarks
      {
        title: "University Official Student ERP & Attendance Portal",
        description: "Check attendance percentage, internal marks, and exam fee clearance notifications.",
        type: "link",
        category: "Portals",
        url: "https://erp.university.edu",
        tags: "ERP,Attendance,Official",
        isPinned: true,
      },
      {
        title: "MDN Web Docs - Modern JavaScript & Web APIs",
        description: "The gold standard documentation for HTML, CSS, Fetch API, and DOM manipulation.",
        type: "link",
        category: "References",
        url: "https://developer.mozilla.org",
        tags: "WebDev,Docs,Reference",
        isPinned: false,
      },
      {
        title: "LeetCode Blind 75 Curated Algorithms Sheet",
        description: "Essential DSA problems list to practice before internship campus drives.",
        type: "link",
        category: "Prep & Coding",
        url: "https://leetcode.com",
        tags: "DSA,Coding,Interviews",
        isPinned: false,
      },
      {
        title: "Visualgo: Visualising Data Structures & Algorithms",
        description: "Interactive visualizer for BST, Sorting, Graph traversals (Dijkstra, BFS, DFS).",
        type: "link",
        category: "Visual Learning",
        url: "https://visualgo.net",
        tags: "Visual,Algorithms,Graphs",
        isPinned: false,
      },

      // Media Vault (Memes, Infographics, Clips)
      {
        title: "Git Workflow Cheat Sheet & Branching Strategy",
        description: "Visual infographic detailing git merge vs git rebase, cherry-pick, and stash commands.",
        type: "media",
        category: "Infographics",
        fileName: "git_workflow_infographic.png",
        filePath: "https://images.unsplash.com/photo-1618401471353-b98aedd04e11?auto=format&fit=crop&w=1200&q=80",
        mimeType: "image/png",
        tags: "Git,Infographic,CheatSheet",
        isPinned: true,
      },
      {
        title: "Relatable CS Meme: When the code works on first compile",
        description: "Saved to share with project group chat when demo day arrives.",
        type: "media",
        category: "Memes",
        fileName: "coding_meme_works.jpg",
        filePath: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
        mimeType: "image/jpeg",
        tags: "Meme,Fun,ProjectGroup",
        isPinned: false,
      },
      {
        title: "System Architecture: Microservices vs Monolith",
        description: "High-resolution diagram comparing request flow and caching layers.",
        type: "media",
        category: "Architecture",
        fileName: "system_architecture_diagram.png",
        filePath: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
        mimeType: "image/png",
        tags: "SystemDesign,Diagram,Tech",
        isPinned: false,
      },

      // Quick Notes & Sticky Reminders
      {
        title: "Lab Incharge Signature Timings",
        description: "Sir is available in Cabin 204 only between 03:00 PM and 04:30 PM on Tuesday & Thursday. Get the index page signed before this week.",
        type: "note",
        category: "Important Notes",
        priority: "high",
        tags: "Reminder,Lab,Urgent",
        isPinned: true,
      },
      {
        title: "Scholarship Renewal Document Checklist",
        description: "1. Previous year grade card\n2. Income certificate renewal\n3. Bonafide student letter from Registrar office counter 4",
        type: "note",
        category: "Admin Tasks",
        priority: "normal",
        tags: "CollegeAdmin,Checklist",
        isPinned: false,
      },
    ],
  });

  console.log("Seeding complete! Added subjects, timetable, academic events, and rich resource records.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
