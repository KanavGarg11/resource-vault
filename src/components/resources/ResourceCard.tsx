"use client";

import { useState } from "react";
import { Resource } from "@/lib/types";
import { useAdmin } from "@/hooks/useAdmin";
import {
  FileText,
  CheckSquare,
  Link as LinkIcon,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Pin,
  Calendar,
  Eye,
  Clock,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow, isPast, format } from "date-fns";

interface ResourceCardProps {
  resource: Resource;
  onDelete?: (id: string) => void;
  onToggleStatus?: (id: string, newStatus: "pending" | "in-progress" | "completed") => void;
  onPreview?: (resource: Resource) => void;
}

export function ResourceCard({
  resource,
  onDelete,
  onToggleStatus,
  onPreview,
}: ResourceCardProps) {
  const { isAdmin } = useAdmin();
  const [copied, setCopied] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const linkToCopy = resource.url || (resource.filePath ? window.location.origin + resource.filePath : "");
    if (linkToCopy) {
      navigator.clipboard.writeText(linkToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to delete "${resource.title}"?`)) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/resources/${resource.id}`, {
        method: "DELETE",
      });
      if (res.ok && onDelete) {
        onDelete(resource.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleCompleted = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin || !onToggleStatus) return;
    const nextStatus = resource.status === "completed" ? "pending" : "completed";
    onToggleStatus(resource.id, nextStatus);
  };

  // Due date calculations
  let dueDateText = "";
  let isOverdue = false;
  let isNearDue = false;

  if (resource.dueDate) {
    const d = new Date(resource.dueDate);
    isOverdue = isPast(d) && resource.status !== "completed";
    const hoursRemaining = (d.getTime() - Date.now()) / (1000 * 60 * 60);
    isNearDue = hoursRemaining > 0 && hoursRemaining <= 48 && resource.status !== "completed";

    dueDateText = isOverdue
      ? `Overdue (${formatDistanceToNow(d)} ago)`
      : `Due ${formatDistanceToNow(d, { addSuffix: true })}`;
  }

  // Domain extractor for links
  let domain = "";
  if (resource.url) {
    try {
      domain = new URL(resource.url).hostname.replace("www.", "");
    } catch {
      domain = resource.url;
    }
  }

  const getTypeStyles = () => {
    switch (resource.type) {
      case "study":
        return {
          icon: FileText,
          color: "text-blue-500 dark:text-blue-400",
          bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60",
          tag: "Study Doc",
        };
      case "assignment":
        return {
          icon: CheckSquare,
          color: "text-amber-500 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60",
          tag: "Assignment",
        };
      case "link":
        return {
          icon: LinkIcon,
          color: "text-violet-500 dark:text-violet-400",
          bg: "bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-900/60",
          tag: "Link",
        };
      case "media":
        return {
          icon: ImageIcon,
          color: "text-emerald-500 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60",
          tag: "Media",
        };
      default:
        return {
          icon: Sparkles,
          color: "text-indigo-500 dark:text-indigo-400",
          bg: "bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60",
          tag: "Note",
        };
    }
  };

  const typeConfig = getTypeStyles();
  const TypeIcon = typeConfig.icon;

  return (
    <div
      onClick={() => onPreview && onPreview(resource)}
      className={`group relative rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
        resource.status === "completed"
          ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-75"
          : isNearDue
          ? "bg-amber-50/30 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80 shadow-md shadow-amber-500/5 hover:border-amber-400"
          : isOverdue
          ? "bg-rose-50/30 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80 shadow-md shadow-rose-500/5 hover:border-rose-400"
          : "bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-300 dark:hover:border-indigo-800 hover:shadow-lg hover:shadow-indigo-500/5"
      }`}
    >
      {/* Top Media Preview if image */}
      {resource.type === "media" && resource.filePath && (
        <div className="relative w-full h-44 bg-slate-950 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resource.filePath}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs">
            <span className="bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md font-mono text-[10px]">
              {resource.mimeType?.split("/")[1]?.toUpperCase() || "IMAGE"}
            </span>
          </div>
        </div>
      )}

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Header Tags & Status */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Type Pill */}
            <span
              className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg border ${typeConfig.bg} ${typeConfig.color}`}
            >
              <TypeIcon className="w-3 h-3" />
              <span>{typeConfig.tag}</span>
            </span>

            {/* Category / Subject Pill */}
            {resource.category && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {resource.category}
              </span>
            )}

            {/* Pinned Icon */}
            {resource.isPinned && (
              <span
                className="text-amber-500 bg-amber-50 dark:bg-amber-950/60 p-1 rounded-md"
                title="Pinned Resource"
              >
                <Pin className="w-3 h-3 fill-amber-500" />
              </span>
            )}
          </div>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
              {resource.type === "assignment" && (
                <button
                  onClick={handleToggleCompleted}
                  className={`p-1 rounded-lg text-xs transition-colors ${
                    resource.status === "completed"
                      ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                      : "text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                  title={
                    resource.status === "completed"
                      ? "Mark as Pending"
                      : "Mark as Completed"
                  }
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors"
                title="Delete Resource"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h4
          className={`font-semibold text-sm leading-snug line-clamp-2 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
            resource.status === "completed" ? "line-through text-slate-400" : ""
          }`}
        >
          {resource.title}
        </h4>

        {/* Description / Excerpt */}
        {resource.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>
        )}

        {/* Assignment Due Date Banner */}
        {resource.dueDate && (
          <div
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl ${
              resource.status === "completed"
                ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                : isOverdue
                ? "bg-rose-100/70 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-semibold"
                : isNearDue
                ? "bg-amber-100/70 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300"
            }`}
          >
            {isOverdue ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span className="truncate">{dueDateText}</span>
            {resource.priority === "urgent" && (
              <span className="ml-auto text-[10px] px-1.5 py-0.2 bg-rose-500 text-white rounded font-bold uppercase">
                Urgent
              </span>
            )}
          </div>
        )}

        {/* Domain Badge for Links */}
        {domain && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <LinkIcon className="w-3 h-3 text-slate-400" />
            <span className="font-mono text-[11px] truncate">{domain}</span>
          </div>
        )}

        {/* File metadata for PDFs and docs */}
        {resource.fileName && (
          <div className="flex items-center justify-between text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
            <span className="truncate max-w-[170px]">{resource.fileName}</span>
            {resource.fileSize && (
              <span>{(resource.fileSize / 1024 / 1024).toFixed(1)} MB</span>
            )}
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
          <span className="text-[10px] text-slate-400">
            {format(new Date(resource.createdAt), "MMM d, yyyy")}
          </span>

          <div className="flex items-center gap-1">
            {/* Copy Link Button */}
            {(resource.url || resource.filePath) && (
              <button
                onClick={handleCopyLink}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Copy link"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Direct Open Link */}
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Open in new tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Direct Download File */}
            {resource.filePath && (
              <a
                href={resource.filePath}
                download={resource.fileName || "download"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Preview Button */}
            {onPreview && (
              <button
                onClick={() => onPreview(resource)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold hover:bg-indigo-100 transition-colors ml-1"
              >
                <Eye className="w-3 h-3" />
                <span>View</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
