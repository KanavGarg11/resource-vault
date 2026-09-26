"use client";

import React, { useState } from "react";
import { THEME_CONFIG, CardTheme } from "@/lib/types";
import {
  Copy,
  Check,
  ExternalLink,
  Download,
  FileText,
  Clock,
  Sparkles,
  BookOpen,
  CalendarDays,
  CheckSquare,
  X,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";

const THEME_ICONS: Record<string, any> = {
  BookOpen,
  Clock,
  CalendarDays,
  CheckSquare,
  Sparkles,
};

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

export function SharedCardView({ card }: { card: any }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const themeMeta = THEME_CONFIG[card.theme as CardTheme] || THEME_CONFIG.study;
  const ThemeIcon = THEME_ICONS[themeMeta.icon] || Sparkles;

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-xl">
      {/* Card Header */}
      <div className="p-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${themeMeta.bg} ${themeMeta.color} border ${themeMeta.border}`}
            >
              <ThemeIcon className="w-3.5 h-3.5" />
              <span>{themeMeta.label}</span>
            </span>
            <span className="text-xs text-slate-400">
              • {card.items.length} {card.items.length === 1 ? "item" : "items"}
            </span>
          </div>

          <span className="text-xs text-slate-400">
            Updated {format(new Date(card.updatedAt), "MMM d, yyyy")}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3 tracking-tight">
          {card.title}
        </h1>
      </div>

      {/* Items Thread */}
      <div className="p-6 space-y-4 max-h-[650px] overflow-y-auto">
        {card.items.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            This card doesn't have any items yet.
          </div>
        ) : (
          card.items.map((item: any) => {
            const isImg = isImageItem(item);
            const isPdf =
              item.type === "pdf" ||
              item.mimeType?.includes("pdf") ||
              item.fileName?.toLowerCase().endsWith(".pdf");
            const isLink =
              item.type === "link" ||
              (item.content &&
                (item.content.startsWith("http://") || item.content.startsWith("https://")));

            return (
              <div
                key={item.id}
                className="group relative bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 transition-all hover:border-slate-300 dark:hover:border-slate-600"
              >
                {/* Header row of item: timestamp & quick copy */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{format(new Date(item.createdAt), "MMM d, h:mm a")}</span>
                  </div>

                  {item.content && (
                    <button
                      onClick={() => handleCopyText(item.id, item.content)}
                      className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                      title="Copy content"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Content rendering */}
                {/* 1. Image */}
                {isImg && item.filePath && (
                  <div className="mb-3">
                    <div
                      onClick={() => setLightboxImage(item.filePath)}
                      className="relative rounded-xl overflow-hidden cursor-zoom-in max-h-96 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 group/img"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.filePath}
                        alt={item.fileName || "Uploaded document"}
                        className="w-full h-auto object-contain max-h-96 rounded-xl transition-transform duration-200 group-hover/img:scale-[1.01]"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {/* 2. PDF or File Attachment */}
                {!isImg && item.filePath && (
                  <div className="flex items-center justify-between p-3 mb-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                        {isPdf ? <FileText className="w-5 h-5 text-rose-500" /> : <FileText className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {item.fileName || "Document"}
                        </p>
                        {item.fileSize && (
                          <p className="text-[10px] text-slate-400">
                            {(item.fileSize / 1024).toFixed(0)} KB
                          </p>
                        )}
                      </div>
                    </div>

                    <a
                      href={item.filePath}
                      download={item.fileName || true}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                )}

                {/* 3. Link */}
                {isLink && item.content && (
                  <div className="mb-2">
                    <a
                      href={item.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline break-all bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.content}</span>
                    </a>
                  </div>
                )}

                {/* 4. Text Note */}
                {!isLink && item.content && (
                  <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {item.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Lightbox for full size photo zoom */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Full size view"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
