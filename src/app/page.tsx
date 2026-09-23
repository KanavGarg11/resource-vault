"use client";

import { useState, useEffect } from "react";
import { Resource } from "@/lib/types";
import { OmniDropBar } from "@/components/dashboard/OmniDropBar";
import { TodayScheduleWidget } from "@/components/dashboard/TodayScheduleWidget";
import { UrgentDeadlinesWidget } from "@/components/dashboard/UrgentDeadlinesWidget";
import { UpcomingExamsWidget } from "@/components/dashboard/UpcomingExamsWidget";
import { QuickNotesWidget } from "@/components/dashboard/QuickNotesWidget";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { FilePreviewModal } from "@/components/resources/FilePreviewModal";
import { BottomNav } from "@/components/layout/BottomNav";
import {
  BookOpen,
  CheckSquare,
  CalendarDays,
  Bookmark,
  Image as ImageIcon,
  Search,
  SlidersHorizontal,
  FolderOpen,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isMobileDropOpen, setIsMobileDropOpen] = useState(false);

  const fetchResources = async () => {
    try {
      const res = await fetch("/api/resources");
      if (res.ok) {
        const data = await res.json();
        setResources(data.resources || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleToggleStatus = async (
    id: string,
    newStatus: "pending" | "in-progress" | "completed"
  ) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setResources((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteResource = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  // Filtered resources for recent feed
  const filteredResources = resources.filter((item) => {
    const matchesFilter =
      selectedFilter === "all" ? true : item.type === selectedFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const assignments = resources.filter((r) => r.type === "assignment");
  const notes = resources.filter((r) => r.type === "note");

  const HUBS = [
    {
      title: "Study Vault",
      desc: "Course PDFs, notes & PYQs",
      href: "/study",
      icon: BookOpen,
      count: resources.filter((r) => r.type === "study").length,
      color: "from-blue-600 to-cyan-600",
    },
    {
      title: "Assignments",
      desc: "Track deadlines & tasks",
      href: "/assignments",
      icon: CheckSquare,
      count: assignments.filter((r) => r.status !== "completed").length,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "Timetable & Exams",
      desc: "Weekly schedule & calendar",
      href: "/timetable",
      icon: CalendarDays,
      count: "5 Days",
      color: "from-violet-600 to-purple-600",
    },
    {
      title: "Bookmarks",
      desc: "Portals, tools & links",
      href: "/links",
      icon: Bookmark,
      count: resources.filter((r) => r.type === "link").length,
      color: "from-indigo-600 to-blue-600",
    },
    {
      title: "Media Vault",
      desc: "Images, memes & clips",
      href: "/media",
      icon: ImageIcon,
      count: resources.filter((r) => r.type === "media").length,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Hero / Omni-Input Drop Section */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Student Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Never lose an assignment, study PDF, or link again. Everything categorized and visually at hand.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400">Total Items: </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {resources.length}
              </span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400">Pending Due: </span>
              <span className="font-bold text-amber-600 dark:text-amber-400">
                {assignments.filter((a) => a.status !== "completed").length}
              </span>
            </div>
          </div>
        </div>

        {/* Omni-Drop Input Bar */}
        <OmniDropBar onResourceCreated={fetchResources} />
      </section>

      {/* Bento Grid: Today's Schedule + Deadlines + Exams + Quick Notes */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Today's Timetable Widget */}
        <TodayScheduleWidget />

        {/* Urgent Deadlines Widget */}
        <UrgentDeadlinesWidget
          assignments={assignments}
          onToggleStatus={handleToggleStatus}
          onPreview={setPreviewResource}
        />

        {/* Academic Calendar & Exam Notices Widget */}
        <UpcomingExamsWidget />

        {/* Quick Notes & Scratchpad (span full width or bottom card) */}
        <div className="md:col-span-2 lg:col-span-3">
          <QuickNotesWidget
            notes={notes}
            onPreview={setPreviewResource}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </section>

      {/* Category Hubs Quick-Launch Row */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-indigo-500" />
            <span>Resource Hubs</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {HUBS.map((hub) => {
            const Icon = hub.icon;
            return (
              <Link
                key={hub.href}
                href={hub.href}
                className="group relative p-4 rounded-2xl glass-panel hover:border-indigo-400 dark:hover:border-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${hub.color} flex items-center justify-center text-white shadow-sm`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {hub.count}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {hub.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {hub.desc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Open Hub</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recent Drops & Global Feed */}
      <section id="recent-feed" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Recent Vault Drops
            </h2>
            <p className="text-xs text-slate-400">
              Live feed of all files, bookmarks, tasks, and media
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources, tags, files..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All" },
                { id: "study", label: "Study" },
                { id: "assignment", label: "Assignments" },
                { id: "link", label: "Links" },
                { id: "media", label: "Media" },
                { id: "note", label: "Notes" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedFilter === filter.id
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Resource Cards Grid */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Loading your resources...
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-2">
            <SlidersHorizontal className="w-8 h-8 mx-auto text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No matching resources found
            </h4>
            <p className="text-xs text-slate-400">
              Try adjusting your search query or drop a new item above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((item) => (
              <ResourceCard
                key={item.id}
                resource={item}
                onDelete={handleDeleteResource}
                onToggleStatus={handleToggleStatus}
                onPreview={setPreviewResource}
              />
            ))}
          </div>
        )}
      </section>

      {/* File & Note Preview Modal */}
      <FilePreviewModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* Mobile Modal Omni Drop */}
      {isMobileDropOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <OmniDropBar
              isModal
              onClose={() => setIsMobileDropOpen(false)}
              onResourceCreated={() => {
                fetchResources();
                setIsMobileDropOpen(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav onQuickDropOpen={() => setIsMobileDropOpen(true)} />
    </div>
  );
}
