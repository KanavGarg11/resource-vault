"use client";

import { Card, THEME_CONFIG } from "@/lib/types";
import { useAdmin } from "@/hooks/useAdmin";
import {
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Trash2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CardGridItemProps {
  card: Card;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

export function CardGridItem({ card, onClick, onDelete }: CardGridItemProps) {
  const { isAdmin } = useAdmin();
  const theme = THEME_CONFIG[card.theme] || THEME_CONFIG.personal;
  const items = card.items || [];
  const itemCount = card._count?.items ?? items.length;

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || !onDelete) return;
    if (confirm(`Delete card "${card.title}" and all its contents?`)) {
      onDelete(card.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="group relative h-72 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
    >
      {/* Top Header */}
      <div className="p-4 sm:p-5 pb-2 shrink-0">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Theme Pill Badge */}
          <span
            className={`text-[10px] font-bold px-2.5 py-0.8 rounded-lg border uppercase tracking-wider ${theme.bg} ${theme.border} ${theme.color}`}
          >
            {theme.label}
          </span>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}</span>

            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 opacity-0 group-hover:opacity-100 transition-all ml-1"
                title="Delete Card"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bold Title */}
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {card.title}
        </h3>
      </div>

      {/* Card Content Snippet Area (Visible up to where it can fit) */}
      <div className="flex-1 px-4 sm:px-5 py-1 overflow-hidden relative space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
            Empty card thread. Tap to open and drop notes or files.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2.5 space-y-1"
            >
              {/* Image Snippet */}
              {item.type === "image" && item.filePath && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-medium truncate">{item.fileName || "Image"}</span>
                </div>
              )}

              {/* PDF Snippet */}
              {item.type === "pdf" && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                  <span className="font-medium truncate">{item.fileName || "PDF Document"}</span>
                </div>
              )}

              {/* Link Snippet */}
              {item.type === "link" && item.content && (
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium truncate">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{item.content}</span>
                </div>
              )}

              {/* File Snippet */}
              {item.type === "file" && item.fileName && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium truncate">{item.fileName}</span>
                </div>
              )}

              {/* Text Message Snippet */}
              {item.content && item.type !== "link" && (
                <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {item.content}
                </p>
              )}
            </div>
          ))
        )}

        {/* Subtle Fade-Out Mask at the bottom */}
        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-white dark:from-slate-900 to-transparent pointer-events-none" />
      </div>

      {/* Bottom Footer Action */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        <span className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>{itemCount} item{itemCount === 1 ? "" : "s"}</span>
        </span>
        <span className="flex items-center gap-1">
          <span>Open Thread</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </span>
      </div>
    </div>
  );
}
