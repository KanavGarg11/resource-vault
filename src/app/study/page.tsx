"use client";

import { useState, useEffect } from "react";
import { Resource } from "@/lib/types";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { FilePreviewModal } from "@/components/resources/FilePreviewModal";
import { OmniDropBar } from "@/components/dashboard/OmniDropBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAdmin } from "@/hooks/useAdmin";
import {
  BookOpen,
  Search,
  Plus,
  SlidersHorizontal,
  FolderCheck,
} from "lucide-react";

const SUBJECTS = [
  "All Subjects",
  "Operating Systems",
  "Computer Networks",
  "Database Management",
  "Web Development",
  "Design & Analysis of Algo",
];

const TAGS = ["All", "Lecture Notes", "PYQ", "Cheat Sheet", "Important"];

export default function StudyVaultPage() {
  const { isAdmin, openPinModal } = useAdmin();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedTag, setSelectedTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);

  const fetchStudyResources = async () => {
    try {
      const res = await fetch("/api/resources?type=study");
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
    fetchStudyResources();
  }, []);

  const handleDelete = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = resources.filter((item) => {
    const matchesSubject =
      selectedSubject === "All Subjects" || item.category === selectedSubject;

    const matchesTag =
      selectedTag === "All" || (item.tags && item.tags.includes(selectedTag));

    const matchesSearch =
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.fileName && item.fileName.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSubject && matchesTag && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Study Vault & Course Files
              </h1>
              <p className="text-xs text-slate-400">
                Organized PDFs, handwritten notes, reference sheets & previous year papers
              </p>
            </div>
          </div>
        </div>

        {/* Add File Trigger */}
        <button
          onClick={() => {
            if (!isAdmin) openPinModal();
            else setIsDropModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Study File</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search study files, topics, lecture titles..."
              className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Quick Tag Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 dark:border-slate-800">
          {SUBJECTS.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubject === subj
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                  : "bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Study Files */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading course materials...</div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-2">
          <FolderCheck className="w-8 h-8 mx-auto text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No study files in this category
          </h4>
          <p className="text-xs text-slate-400">
            Click &ldquo;Upload Study File&rdquo; above to add PDFs or lecture slides.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <ResourceCard
              key={item.id}
              resource={item}
              onDelete={handleDelete}
              onPreview={setPreviewResource}
            />
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* Modal Drop */}
      {isDropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <OmniDropBar
              isModal
              onClose={() => setIsDropModalOpen(false)}
              onResourceCreated={() => {
                fetchStudyResources();
                setIsDropModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <BottomNav onQuickDropOpen={() => setIsDropModalOpen(true)} />
    </div>
  );
}
