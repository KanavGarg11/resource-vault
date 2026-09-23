"use client";

import { Resource } from "@/lib/types";
import { useAdmin } from "@/hooks/useAdmin";
import { StickyNote, CheckCircle, ChevronRight, Pin } from "lucide-react";
import Link from "next/link";

interface QuickNotesWidgetProps {
  notes: Resource[];
  onPreview: (resource: Resource) => void;
  onToggleStatus: (id: string, newStatus: "pending" | "in-progress" | "completed") => void;
}

export function QuickNotesWidget({
  notes,
  onPreview,
  onToggleStatus,
}: QuickNotesWidgetProps) {
  const { isAdmin } = useAdmin();

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              To-Dos & Sticky Memos
            </h3>
            <p className="text-[11px] text-slate-400">Formal and informal quick saves</p>
          </div>
        </div>

        <Link
          href="/#recent-feed"
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 flex items-center gap-0.5"
        >
          <span>All Notes</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Notes List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {notes.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No notes saved yet.</div>
        ) : (
          notes.map((note) => {
            const isDone = note.status === "completed";
            return (
              <div
                key={note.id}
                onClick={() => onPreview(note)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isDone
                    ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70"
                    : "bg-white dark:bg-slate-850 border-slate-100 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-800"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-amber-500 fill-amber-500" />
                    )}
                    <h4
                      className={`text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-snug ${
                        isDone ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {note.title}
                    </h4>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStatus(note.id, isDone ? "pending" : "completed");
                      }}
                      className={`p-1 rounded-md text-xs transition-colors shrink-0 ${
                        isDone
                          ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                          : "text-slate-300 hover:text-emerald-500"
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {note.description && (
                  <p
                    className={`text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3 leading-relaxed whitespace-pre-line ${
                      isDone ? "line-through text-slate-400" : ""
                    }`}
                  >
                    {note.description}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
