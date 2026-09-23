"use client";

import { useState, useEffect } from "react";
import { Resource } from "@/lib/types";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { FilePreviewModal } from "@/components/resources/FilePreviewModal";
import { OmniDropBar } from "@/components/dashboard/OmniDropBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAdmin } from "@/hooks/useAdmin";
import { Bookmark, Plus, Search, ExternalLink } from "lucide-react";

export default function BookmarksPage() {
  const { isAdmin, openPinModal } = useAdmin();
  const [links, setLinks] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);

  const fetchLinks = async () => {
    try {
      const res = await fetch("/api/resources?type=link");
      if (res.ok) {
        const data = await res.json();
        setLinks(data.resources || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleDelete = (id: string) => {
    setLinks((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredLinks = links.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      !searchQuery.trim() ||
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.url && item.url.toLowerCase().includes(q)) ||
      (item.tags && item.tags.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Important Links & Bookmarks
            </h1>
            <p className="text-xs text-slate-400">
              College ERP portals, official results, study references, and coding tools
            </p>
          </div>
        </div>

        {/* Add Link Trigger */}
        <button
          onClick={() => {
            if (!isAdmin) openPinModal();
            else setIsDropModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Save New Link</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saved bookmarks, website domains, tags..."
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
        />
      </div>

      {/* Grid of Links */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading bookmarks...</div>
      ) : filteredLinks.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-2">
          <Bookmark className="w-8 h-8 mx-auto text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No bookmarks found
          </h4>
          <p className="text-xs text-slate-400">
            Paste any URL into the Quick Drop bar above to save it.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLinks.map((item) => (
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
                fetchLinks();
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
