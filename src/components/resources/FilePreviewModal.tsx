"use client";

import { Resource } from "@/lib/types";
import { X, Download, ExternalLink, Copy, Check, FileText, Image as ImageIcon } from "lucide-react";
import { useState } from "react";

interface FilePreviewModalProps {
  resource: Resource | null;
  onClose: () => void;
}

export function FilePreviewModal({ resource, onClose }: FilePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!resource) return null;

  const handleCopyLink = () => {
    const link = resource.url || (resource.filePath ? window.location.origin + resource.filePath : "");
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const isPdf =
    resource.mimeType === "application/pdf" ||
    (resource.fileName && resource.fileName.toLowerCase().endsWith(".pdf")) ||
    (resource.filePath && resource.filePath.toLowerCase().endsWith(".pdf"));

  const isImage =
    resource.mimeType?.startsWith("image/") ||
    (resource.filePath && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(resource.filePath));

  const isVideo =
    resource.mimeType?.startsWith("video/") ||
    (resource.filePath && /\.(mp4|webm|ogg|mov)$/i.test(resource.filePath));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl h-[88vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 overflow-hidden mr-4">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {resource.title}
              </h3>
              {resource.category && (
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {resource.category}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Copy resource URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* External Open */}
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* Download */}
            {resource.filePath && (
              <a
                href={resource.filePath}
                download={resource.fileName || "download"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </a>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewer Area */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-4 flex flex-col items-center justify-center">
          {/* PDF Viewer */}
          {isPdf && resource.filePath ? (
            <iframe
              src={resource.filePath}
              className="w-full h-full rounded-2xl border border-slate-300 dark:border-slate-800 shadow-inner bg-white"
              title={resource.title}
            />
          ) : isImage && resource.filePath ? (
            <div className="relative max-h-full max-w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resource.filePath}
                alt={resource.title}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-xl"
              />
            </div>
          ) : isVideo && resource.filePath ? (
            <div className="w-full max-w-3xl flex items-center justify-center">
              <video
                src={resource.filePath}
                controls
                autoPlay
                className="w-full rounded-2xl shadow-xl max-h-[75vh]"
              />
            </div>
          ) : (
            /* Fallback Text Note / Link Preview */
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  {resource.title}
                </h2>
                {resource.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {resource.tags.split(",").map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-medium"
                      >
                        #{t.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {resource.description && (
                <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                  {resource.description}
                </div>
              )}

              {resource.url && (
                <div className="pt-2">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors"
                  >
                    <span>Visit Link</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
