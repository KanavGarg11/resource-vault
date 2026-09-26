"use client";

import { useState } from "react";
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
  Loader2,
  Share2,
  Globe,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ShareCardModal } from "./ShareCardModal";

interface CardGridItemProps {
  card: Card;
  onClick: () => void;
  onDelete?: (id: string) => void;
}

function isImageItem(item: {
  type?: string;
  filePath?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
}) {
  if (item.type === "image") return true;
  if (item.mimeType && item.mimeType.toLowerCase().startsWith("image/")) return true;
  const pathOrName = (item.filePath || item.fileName || "").toLowerCase();
  return /\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|avif)$/i.test(pathOrName);
}

export function CardGridItem({ card, onClick, onDelete }: CardGridItemProps) {
  const { isAdmin } = useAdmin();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(card.isPublic ?? false);
  const [shareToken, setShareToken] = useState(card.shareToken);

  const theme = THEME_CONFIG[card.theme] || THEME_CONFIG.personal;
  const items = card.items || [];
  const itemCount = card._count?.items ?? items.length;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || !onDelete || isDeleting) return;
    if (confirm(`Delete card "${card.title}" and all its contents?`)) {
      setIsDeleting(true);
      try {
        const res = await fetch(`/api/cards/${card.id}`, {
          method: "DELETE",
        });
        if (res.ok) {
          onDelete(card.id);
        } else {
          const data = await res.json().catch(() => ({}));
          alert(data.error || "Failed to delete card");
        }
      } catch (err) {
        console.error("Error deleting card:", err);
        alert("Failed to delete card. Please try again.");
      } finally {
        setIsDeleting(false);
      }
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
          {/* Theme Pill Badge & Share Status */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.8 rounded-lg border uppercase tracking-wider ${theme.bg} ${theme.border} ${theme.color}`}
            >
              {theme.label}
            </span>
            {isPublic && (
              <span
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                title="Public Link Active"
              >
                <Globe className="w-2.5 h-2.5" />
                <span>Shared</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span>{formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}</span>

            {isAdmin && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsShareOpen(true);
                }}
                className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-all ml-1 ${
                  isPublic
                    ? "text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                    : "text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/60"
                }`}
                title={isPublic ? "Shared Link Active" : "Share Card Link"}
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>
            )}

            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                title="Delete Card"
              >
                {isDeleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bold Title */}
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {card.title}
        </h3>
      </div>

      {/* Card Content Snippet Area (WhatsApp-Style: latest at bottom, older stacking upwards) */}
      <div className="flex-1 px-4 sm:px-5 py-1 overflow-hidden relative flex flex-col-reverse justify-start gap-2">
        {/* Subtle Fade-Out Mask at the top for older overflowing messages */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white dark:from-slate-900 to-transparent pointer-events-none z-10" />

        {items.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400 italic">
            Empty card thread. Tap to open and drop notes or files.
          </div>
        ) : (
          items.map((item) => {
            const isImg = isImageItem(item);

            return (
              <div
                key={item.id}
                className="text-xs bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80 rounded-xl p-2.5 space-y-1.5 overflow-hidden shrink-0"
              >
                {/* 1. Real Image Thumbnail Preview */}
                {isImg && item.filePath && (
                  <div className="space-y-1">
                    <div className="rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700/50 h-28 w-full flex items-center justify-center relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.filePath}
                        alt={item.fileName || "Image preview"}
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                    {item.content && (
                      <p className="text-slate-600 dark:text-slate-300 font-medium line-clamp-1">
                        {item.content}
                      </p>
                    )}
                  </div>
                )}

                {/* 2. PDF Snippet */}
                {item.type === "pdf" && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="font-medium truncate">{item.fileName || "PDF Document"}</span>
                  </div>
                )}

                {/* 3. Link Snippet */}
                {item.type === "link" && item.content && (
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium truncate">
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{item.content}</span>
                  </div>
                )}

                {/* 4. Generic File Snippet */}
                {!isImg && item.type === "file" && item.fileName && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{item.fileName}</span>
                  </div>
                )}

                {/* 5. Text Message Snippet (when not already rendered as image caption) */}
                {!isImg && item.content && item.type !== "link" && (
                  <p className="text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {item.content}
                  </p>
                )}
              </div>
            );
          })
        )}
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

      {/* Share Card Modal */}
      {isShareOpen && (
        <div onClick={(e) => e.stopPropagation()}>
          <ShareCardModal
            cardId={card.id}
            cardTitle={card.title}
            isOpen={isShareOpen}
            initialIsPublic={isPublic}
            initialShareToken={shareToken}
            onClose={() => setIsShareOpen(false)}
            onShareUpdated={(newPublic, newToken) => {
              setIsPublic(newPublic);
              setShareToken(newToken);
            }}
          />
        </div>
      )}
    </div>
  );
}
