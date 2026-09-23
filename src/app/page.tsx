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
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
} from "lucide-react";

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

  // Filtered resources based on search and type filter
  const filteredResources = resources.filter((item) => {
    const matchesFilter =
      selectedFilter === "all" ? true : item.type === selectedFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.tags && item.tags.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.fileName && item.fileName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const assignments = resources.filter((r) => r.type === "assignment");
  const notes = resources.filter((r) => r.type === "note");

  const FILTER_TABS = [
    { id: "all", label: "All" },
    { id: "study", label: "Study" },
    { id: "assignment", label: "Assignments" },
    { id: "link", label: "Links" },
    { id: "media", label: "Media" },
    { id: "note", label: "Notes" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
      {/* 1. Global Search & Filter Bar (Moved just below navbar, above upload area) */}
      <section className="space-y-3">
        <div className="glass-panel rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/90 dark:border-slate-800/90 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all study files, assignments, links, memes, and jokes..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
              {FILTER_TABS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedFilter === filter.id
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Feedback Indicator */}
          {searchQuery && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
              <span>
                Found <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{filteredResources.length}</strong> matching item(s) for &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. Upload / Omni-Drop Bar (Just below search area) */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Student Command Center
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Drop any file, link, note, or assignment to keep it organized and visually at hand.
            </p>
          </div>

          {/* Metrics Badges */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <div className="px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 text-xs shrink-0">
              <span className="text-slate-500 dark:text-slate-400">Total Vault: </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {resources.length}
              </span>
            </div>
            <div className="px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 text-xs shrink-0">
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

      {/* 3. Bento Grid: Timetable + Deadlines + Exams + Headed Sticky Memos */}
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

        {/* Headed To-Dos & Sticky Memos (Full Width) */}
        <div className="md:col-span-2 lg:col-span-3">
          <QuickNotesWidget
            notes={notes}
            onPreview={setPreviewResource}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDeleteResource}
          />
        </div>
      </section>

      {/* 4. Recent Drops Feed (Directly below memos, with resource hubs removed) */}
      <section id="recent-feed" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Recent Vault Drops
            </h2>
            <p className="text-xs text-slate-400">
              Live feed of saved files, bookmarks, tasks, and media
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Showing {filteredResources.length} item(s)
          </span>
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
