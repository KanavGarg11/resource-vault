"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { CardTheme, THEME_CONFIG } from "@/lib/types";
import {
  X,
  Plus,
  BookOpen,
  Clock,
  CalendarDays,
  CheckSquare,
  Sparkles,
  Paperclip,
  Loader2,
  UploadCloud,
} from "lucide-react";
import { compressImageIfNeeded } from "@/lib/compressImage";

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCardCreated: () => void;
  defaultTheme?: CardTheme;
}

export function CreateCardModal({
  isOpen,
  onClose,
  onCardCreated,
  defaultTheme = "study",
}: CreateCardModalProps) {
  const { isAdmin, openPinModal } = useAdmin();

  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState<CardTheme>(defaultTheme);
  const [initialText, setInitialText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      openPinModal();
      return;
    }

    if (!title.trim()) return;

    setLoading(true);

    try {
      let initialItem: any = null;

      // Upload file if selected
      if (file) {
        let fileToUpload = file;
        if (file.type.startsWith("image/")) {
          setCompressing(true);
          try {
            fileToUpload = await compressImageIfNeeded(file);
          } finally {
            setCompressing(false);
          }
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          const mime = (fileToUpload.type || file.type || "").toLowerCase();
          const name = (fileToUpload.name || file.name || "").toLowerCase();

          let itemType: "text" | "link" | "image" | "pdf" | "file" = "file";
          const isImg =
            mime.startsWith("image/") ||
            /\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|avif)$/i.test(name);
          const isPdf = mime.includes("pdf") || name.endsWith(".pdf");

          if (isImg) {
            itemType = "image";
          } else if (isPdf) {
            itemType = "pdf";
          }

          initialItem = {
            type: itemType,
            content: initialText.trim() || null,
            filePath: uploadData.file.filePath,
            fileName: uploadData.file.fileName,
            fileSize: uploadData.file.fileSize,
            mimeType: uploadData.file.mimeType,
          };
        }
      } else if (initialText.trim()) {
        const isUrl =
          initialText.trim().startsWith("http://") ||
          initialText.trim().startsWith("https://");

        initialItem = {
          type: isUrl ? "link" : "text",
          content: initialText.trim(),
        };
      }

      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          theme,
          initialItem,
        }),
      });

      if (res.ok) {
        setTitle("");
        setInitialText("");
        setFile(null);
        onCardCreated();
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create card");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error creating card");
    } finally {
      setLoading(false);
    }
  };

  const THEMES: { id: CardTheme; label: string; icon: any; color: string }[] = [
    { id: "study", label: "Study", icon: BookOpen, color: "text-blue-500" },
    { id: "study-to-do", label: "Study To-Do", icon: Clock, color: "text-amber-500" },
    { id: "schedules", label: "Schedules", icon: CalendarDays, color: "text-violet-500" },
    { id: "to-do", label: "To-Do", icon: CheckSquare, color: "text-emerald-500" },
    { id: "personal", label: "Personal", icon: Sparkles, color: "text-rose-500" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Create a New Card
              </h3>
              <p className="text-xs text-slate-400">
                A dedicated topic thread to drop notes, links, and files over time
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Card Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Operating Systems Notes, Sports Shoes Wishlist, Mid-Term Exam Dates"
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-900 dark:text-white placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Theme Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Theme / Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEMES.map((t) => {
                const Icon = t.icon;
                const isSel = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      isSel
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSel ? "text-white" : t.color}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Initial Message (Optional) */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              First Item or Note <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={2}
              value={initialText}
              onChange={(e) => setInitialText(e.target.value)}
              placeholder="Type your first note, paste a link, or thoughts for this card..."
              className="w-full bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          {/* Attach Initial File (Optional) */}
          <div>
            <input
              id="create-card-file"
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-between bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-2 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-semibold text-slate-900 dark:text-white truncate">
                    {file.name}
                  </span>
                  <span className="text-slate-400 shrink-0">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-rose-500 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="create-card-file"
                className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 cursor-pointer transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5" />
                <span>Attach an initial file, image, or PDF (Optional)</span>
              </label>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || compressing || !title.trim()}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {compressing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Optimizing Image...</span>
              </>
            ) : loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Card...</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create Card</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
