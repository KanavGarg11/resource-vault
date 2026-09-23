"use client";

import { useState } from "react";
import { Resource } from "@/lib/types";
import { useAdmin } from "@/hooks/useAdmin";
import {
  StickyNote,
  CheckCircle,
  Copy,
  Check,
  Pin,
  Plus,
  Smile,
  ShoppingBag,
  GraduationCap,
  ClipboardList,
  Sparkles,
  ExternalLink,
  Trash2,
} from "lucide-react";

interface QuickNotesWidgetProps {
  notes: Resource[];
  onPreview: (resource: Resource) => void;
  onToggleStatus: (id: string, newStatus: "pending" | "in-progress" | "completed") => void;
  onDelete?: (id: string) => void;
}

export function QuickNotesWidget({
  notes,
  onPreview,
  onToggleStatus,
  onDelete,
}: QuickNotesWidgetProps) {
  const { isAdmin } = useAdmin();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (e: React.MouseEvent, note: Resource) => {
    e.stopPropagation();
    const textToCopy = `${note.title}\n\n${note.description || ""}`;
    navigator.clipboard.writeText(textToCopy.trim());
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const getCategoryMeta = (cat: string | null | undefined, title: string) => {
    const combined = `${cat || ""} ${title}`.toLowerCase();
    if (combined.includes("joke") || combined.includes("humor") || combined.includes("friend")) {
      return {
        badge: "Humor & Friends",
        icon: Smile,
        color: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-900/60",
        bg: "bg-amber-500/10",
        cardBg: "hover:border-amber-400 dark:hover:border-amber-700",
      };
    }
    if (combined.includes("shopping") || combined.includes("shoes") || combined.includes("wishlist")) {
      return {
        badge: "Shopping & Wishlist",
        icon: ShoppingBag,
        color: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-900/60",
        bg: "bg-emerald-500/10",
        cardBg: "hover:border-emerald-400 dark:hover:border-emerald-700",
      };
    }
    if (combined.includes("lab") || combined.includes("college") || combined.includes("reminder")) {
      return {
        badge: "College Reminders",
        icon: GraduationCap,
        color: "text-sky-600 dark:text-sky-400",
        border: "border-sky-200 dark:border-sky-900/60",
        bg: "bg-sky-500/10",
        cardBg: "hover:border-sky-400 dark:hover:border-sky-700",
      };
    }
    if (combined.includes("admin") || combined.includes("scholarship") || combined.includes("checklist")) {
      return {
        badge: "Formal & Admin",
        icon: ClipboardList,
        color: "text-rose-600 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-900/60",
        bg: "bg-rose-500/10",
        cardBg: "hover:border-rose-400 dark:hover:border-rose-700",
      };
    }
    return {
      badge: cat || "Personal Memo",
      icon: Sparkles,
      color: "text-indigo-600 dark:text-indigo-400",
      border: "border-indigo-200 dark:border-indigo-900/60",
      bg: "bg-indigo-500/10",
      cardBg: "hover:border-indigo-400 dark:hover:border-indigo-700",
    };
  };

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                To-Dos & Sticky Memos
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                {notes.length} Cards
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Headed memo cards for jokes, shopping wishlists, lab notes, and college checklists
            </p>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {notes.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          No sticky memos saved yet. Drop a note using the Quick Drop bar above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => {
            const isDone = note.status === "completed";
            const meta = getCategoryMeta(note.category, note.title);
            const CategoryIcon = meta.icon;

            return (
              <div
                key={note.id}
                onClick={() => onPreview(note)}
                className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md ${
                  isDone
                    ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-65"
                    : `bg-white dark:bg-slate-850 border-slate-200/90 dark:border-slate-800 ${meta.cardBg}`
                }`}
              >
                <div>
                  {/* Card Header: Category Badge & Status / Actions */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.8 rounded-lg border ${meta.bg} ${meta.border} ${meta.color}`}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      <span>{meta.badge}</span>
                    </span>

                    <div className="flex items-center gap-1">
                      {note.isPinned && (
                        <span title="Pinned Memo">
                          <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                        </span>
                      )}

                      {/* Copy Text Button */}
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, note)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Copy note text"
                      >
                        {copiedId === note.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Admin Toggle / Delete */}
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleStatus(note.id, isDone ? "pending" : "completed");
                            }}
                            className={`p-1 rounded-lg transition-colors ${
                              isDone
                                ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                                : "text-slate-300 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            title={isDone ? "Mark pending" : "Mark done"}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>

                          {onDelete && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete "${note.title}"?`)) {
                                  onDelete(note.id);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                              title="Delete memo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Note Title */}
                  <h4
                    className={`font-bold text-sm text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
                      isDone ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {note.title}
                  </h4>

                  {/* Note Description / Bullets */}
                  {note.description && (
                    <div
                      className={`text-xs text-slate-600 dark:text-slate-300 mt-2 space-y-1 leading-relaxed whitespace-pre-line font-normal ${
                        isDone ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {note.description}
                    </div>
                  )}
                </div>

                {/* Tags or Quick Footer */}
                {note.tags && (
                  <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {note.tags.split(",").map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800/60 px-1.5 py-0.5 rounded-md"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
