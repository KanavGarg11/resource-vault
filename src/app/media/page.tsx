"use client";

import { useState, useEffect } from "react";
import { Resource } from "@/lib/types";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { FilePreviewModal } from "@/components/resources/FilePreviewModal";
import { OmniDropBar } from "@/components/dashboard/OmniDropBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAdmin } from "@/hooks/useAdmin";
import { Image as ImageIcon, Plus, Sparkles, Filter } from "lucide-react";

export default function MediaVaultPage() {
  const { isAdmin, openPinModal } = useAdmin();
  const [mediaList, setMediaList] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/resources?type=media");
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.resources || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDelete = (id: string) => {
    setMediaList((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredMedia = mediaList.filter((item) => {
    if (selectedTag === "all") return true;
    if (selectedTag === "memes") {
      return (
        item.category?.toLowerCase().includes("meme") ||
        item.tags?.toLowerCase().includes("meme") ||
        item.title.toLowerCase().includes("meme")
      );
    }
    if (selectedTag === "infographics") {
      return (
        item.category?.toLowerCase().includes("infographic") ||
        item.tags?.toLowerCase().includes("infographic") ||
        item.tags?.toLowerCase().includes("diagram")
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <ImageIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Media & Meme Vault
            </h1>
            <p className="text-xs text-slate-400">
              Saved images, memes, diagrams, and video clips ready to download or share with friends
            </p>
          </div>
        </div>

        {/* Add Media Trigger */}
        <button
          onClick={() => {
            if (!isAdmin) openPinModal();
            else setIsDropModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Image / Meme</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 rounded-2xl glass-panel max-w-sm">
        {[
          { id: "all", label: "All Media" },
          { id: "memes", label: "Memes & Fun" },
          { id: "infographics", label: "Infographics & Diagrams" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTag(tab.id)}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
              selectedTag === tab.id
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Visual Media Gallery Grid */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading media vault...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-2">
          <ImageIcon className="w-8 h-8 mx-auto text-slate-400" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No media saved in this filter
          </h4>
          <p className="text-xs text-slate-400">
            Drop an image or video file above to save it in your vault.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMedia.map((item) => (
            <ResourceCard
              key={item.id}
              resource={item}
              onDelete={handleDelete}
              onPreview={setPreviewResource}
            />
          ))}
        </div>
      )}

      {/* File Preview Lightbox */}
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
                fetchMedia();
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
