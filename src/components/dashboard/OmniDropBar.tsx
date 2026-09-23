"use client";

import { useState, useRef, useEffect } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Sparkles,
  Paperclip,
  Link as LinkIcon,
  BookOpen,
  CheckSquare,
  Image as ImageIcon,
  FileText,
  Send,
  Loader2,
  Calendar,
  X,
  UploadCloud,
  CheckCircle,
} from "lucide-react";
import { ResourceType, ResourcePriority } from "@/lib/types";

interface OmniDropBarProps {
  onResourceCreated?: () => void;
  isModal?: boolean;
  onClose?: () => void;
}

const DEFAULT_SUBJECTS = [
  "Operating Systems",
  "Computer Networks",
  "Database Management",
  "Web Development",
  "Design & Analysis of Algo",
  "General / Personal",
];

export function OmniDropBar({ onResourceCreated, isModal = false, onClose }: OmniDropBarProps) {
  const { isAdmin, openPinModal } = useAdmin();

  const [inputVal, setInputVal] = useState("");
  const [description, setDescription] = useState("");
  const [selectedType, setSelectedType] = useState<ResourceType>("study");
  const [selectedSubject, setSelectedSubject] = useState(DEFAULT_SUBJECTS[0]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<ResourcePriority>("normal");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUploading, setFileUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect type when typing or pasting
  const handleInputChange = (val: string) => {
    setInputVal(val);
    const trimmed = val.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      setSelectedType("link");
      setIsExpanded(true);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setIsExpanded(true);

    if (!inputVal) {
      setInputVal(selectedFile.name);
    }

    // Auto-detect category
    const mime = selectedFile.type.toLowerCase();
    const name = selectedFile.name.toLowerCase();

    if (mime.startsWith("image/") || mime.startsWith("video/") || mime.startsWith("audio/")) {
      setSelectedType("media");
    } else if (
      name.endsWith(".pdf") ||
      name.endsWith(".docx") ||
      name.endsWith(".pptx") ||
      mime.includes("pdf")
    ) {
      setSelectedType("study");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      openPinModal();
      return;
    }

    if (!inputVal.trim() && !file) return;

    setSubmitting(true);
    let uploadedFilePath: string | null = null;
    let originalFileName: string | null = null;
    let fileSize: number | null = null;
    let mimeType: string | null = null;

    // Step 1: Upload file if present
    if (file) {
      setFileUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("File upload failed");
        }

        const uploadData = await uploadRes.json();
        uploadedFilePath = uploadData.file.filePath;
        originalFileName = uploadData.file.fileName;
        fileSize = uploadData.file.fileSize;
        mimeType = uploadData.file.mimeType;
      } catch (err) {
        console.error("Upload error:", err);
        alert("Failed to upload file. Please try again.");
        setSubmitting(false);
        setFileUploading(false);
        return;
      } finally {
        setFileUploading(false);
      }
    }

    // Step 2: Determine URL or File Path
    const isUrl =
      inputVal.trim().startsWith("http://") || inputVal.trim().startsWith("https://");

    const payload = {
      title: inputVal.trim() || originalFileName || "Untitled Drop",
      description: description.trim() || null,
      type: selectedType,
      category:
        selectedType === "study" || selectedType === "assignment"
          ? selectedSubject
          : selectedType === "media"
          ? "Media Gallery"
          : "Saved",
      url: isUrl ? inputVal.trim() : null,
      filePath: uploadedFilePath,
      fileName: originalFileName,
      fileSize,
      mimeType,
      tags: tags.trim() || null,
      dueDate: selectedType === "assignment" && dueDate ? dueDate : null,
      priority: selectedType === "assignment" ? priority : "normal",
      status: selectedType === "assignment" ? "pending" : null,
    };

    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSuccessNotice(true);
        setInputVal("");
        setDescription("");
        setFile(null);
        setDueDate("");
        setTags("");
        setIsExpanded(false);

        if (onResourceCreated) {
          onResourceCreated();
        }

        setTimeout(() => {
          setSuccessNotice(false);
          if (onClose) onClose();
        }, 1200);
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to save resource");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving resource");
    } finally {
      setSubmitting(false);
    }
  };

  const TYPE_OPTIONS: { id: ResourceType; label: string; icon: typeof BookOpen }[] = [
    { id: "study", label: "Study Doc", icon: BookOpen },
    { id: "assignment", label: "Assignment / Task", icon: CheckSquare },
    { id: "link", label: "Link / Bookmark", icon: LinkIcon },
    { id: "media", label: "Media / Meme", icon: ImageIcon },
    { id: "note", label: "Quick Note", icon: FileText },
  ];

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className={`rounded-2xl transition-all ${
        isModal
          ? "bg-white dark:bg-slate-900"
          : "glass-panel p-4 shadow-lg shadow-indigo-500/5 hover:border-indigo-300 dark:hover:border-indigo-800"
      }`}
    >
      {/* Header if in modal */}
      {isModal && (
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Quick Vault Drop
              </h3>
              <p className="text-[11px] text-slate-500">Drop files, links, or tasks instantly</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      )}

      {/* Main Drop Area */}
      <form onSubmit={handleSubmit} className={isModal ? "p-4 space-y-3" : "space-y-3"}>
        {/* Top Input Bar */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Paste link, drop a study file, or type a reminder to save..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {/* File Picker Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors"
            title="Attach file (PDF, Doc, Image, Video)"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Send / Save Button */}
          <button
            type="submit"
            disabled={submitting || (!inputVal.trim() && !file)}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : successNotice ? (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Drop</span>
              </>
            )}
          </button>
        </div>

        {/* Selected File Badge */}
        {file && (
          <div className="flex items-center justify-between bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 rounded-xl px-3 py-2 text-xs">
            <div className="flex items-center gap-2 truncate">
              <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
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
        )}

        {/* Expanded Options (shows when typing, attaching, or clicking) */}
        {(isExpanded || isModal) && (
          <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            {/* Category Type Pills */}
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                Save As
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TYPE_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSel = selectedType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedType(item.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSel
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject Selector for Study & Assignment */}
            {(selectedType === "study" || selectedType === "assignment") && (
              <div>
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
                  Subject / Course
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_SUBJECTS.map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setSelectedSubject(subj)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${
                        selectedSubject === subj
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Assignment Due Date & Priority */}
            {selectedType === "assignment" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Due Date
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-transparent text-xs text-slate-800 dark:text-slate-200 focus:outline-none w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                    Priority
                  </label>
                  <div className="flex gap-1">
                    {(["normal", "high", "urgent"] as ResourcePriority[]).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`flex-1 py-1 rounded-lg text-xs capitalize font-medium transition-colors ${
                          priority === p
                            ? p === "urgent"
                              ? "bg-rose-500 text-white"
                              : p === "high"
                              ? "bg-amber-500 text-white"
                              : "bg-indigo-600 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Optional Description / Notes */}
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Add optional notes, instructions, or context..."
                className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
