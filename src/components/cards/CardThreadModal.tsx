"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardItem, CardTheme, THEME_CONFIG } from "@/lib/types";
import { useAdmin } from "@/hooks/useAdmin";
import {
  X,
  Send,
  Paperclip,
  Trash2,
  Copy,
  Pencil,
  Check,
  ExternalLink,
  Download,
  FileText,
  Image as ImageIcon,
  BookOpen,
  Clock,
  CalendarDays,
  CheckSquare,
  Sparkles,
  Loader2,
  Lock,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

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

interface CardThreadModalProps {
  cardId: string | null;
  onClose: () => void;
  onCardUpdated: () => void;
  onCardDeleted?: (id: string) => void;
}

export function CardThreadModal({
  cardId,
  onClose,
  onCardUpdated,
  onCardDeleted,
}: CardThreadModalProps) {
  const { isAdmin, openPinModal } = useAdmin();

  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [inputText, setInputText] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCard = async () => {
    if (!cardId) return;
    try {
      const res = await fetch(`/api/cards/${cardId}`);
      if (res.ok) {
        const data = await res.json();
        setCard(data.card);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cardId) {
      setLoading(true);
      fetchCard();
    } else {
      setCard(null);
    }
  }, [cardId]);

  useEffect(() => {
    // Auto-scroll to latest message when items load or change
    if (card?.items && card.items.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [card?.items]);

  if (!cardId) return null;

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdmin) {
      openPinModal();
      return;
    }

    if (!inputText.trim() && !attachedFile) return;

    setSending(true);

    try {
      let uploadedFilePath: string | null = null;
      let originalFileName: string | null = null;
      let fileSize: number | null = null;
      let mimeType: string | null = null;
      let itemType: "text" | "link" | "image" | "pdf" | "file" = "text";

      // 1. Upload attached file if present
      if (attachedFile) {
        const formData = new FormData();
        formData.append("file", attachedFile);

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

        const mime = (mimeType || "").toLowerCase();
        const name = (originalFileName || "").toLowerCase();

        const isImg =
          mime.startsWith("image/") ||
          /\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|avif)$/i.test(name);
        const isPdf = mime.includes("pdf") || name.endsWith(".pdf");

        if (isImg) {
          itemType = "image";
        } else if (isPdf) {
          itemType = "pdf";
        } else {
          itemType = "file";
        }
      } else {
        const trimmed = inputText.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
          itemType = "link";
        } else {
          itemType = "text";
        }
      }

      // 2. Post item to card thread
      const res = await fetch(`/api/cards/${cardId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: itemType,
          content: inputText.trim() || null,
          filePath: uploadedFilePath,
          fileName: originalFileName,
          fileSize,
          mimeType,
        }),
      });

      if (res.ok) {
        setInputText("");
        setAttachedFile(null);
        await fetchCard();
        onCardUpdated();
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to add item");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error adding item to card");
    } finally {
      setSending(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!isAdmin || !confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/cards/${cardId}/items?itemId=${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchCard();
        onCardUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCard = async () => {
    if (!isAdmin || !confirm(`Delete entire card "${card?.title}"?`)) return;
    try {
      const res = await fetch(`/api/cards/${cardId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        if (onCardDeleted) onCardDeleted(cardId);
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleStartEdit = (item: CardItem) => {
    setEditingItemId(item.id);
    setEditingText(item.content || "");
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingText("");
  };

  const handleSaveEdit = async (itemId: string) => {
    if (!isAdmin) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/cards/${cardId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          content: editingText,
        }),
      });

      if (res.ok) {
        setEditingItemId(null);
        setEditingText("");
        await fetchCard();
        onCardUpdated();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update item");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error updating item");
    } finally {
      setSavingEdit(false);
    }
  };

  const themeInfo = card ? THEME_CONFIG[card.theme] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0 mr-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/60 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                {card?.title || "Loading Card..."}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {themeInfo && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${themeInfo.bg} ${themeInfo.border} ${themeInfo.color}`}
                  >
                    {themeInfo.label}
                  </span>
                )}
                <span className="text-[11px] text-slate-400">
                  {card?.items?.length || 0} message{card?.items?.length === 1 ? "" : "s"}
                </span>
                {card?.updatedAt && (
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    • Active {formatDistanceToNow(new Date(card.updatedAt), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isAdmin && (
              <button
                onClick={handleDeleteCard}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                title="Delete Card"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* WhatsApp-Style Linear Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-slate-100/70 dark:bg-slate-950/70">
          {loading ? (
            <div className="py-16 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span>Loading thread...</span>
            </div>
          ) : !card?.items || card.items.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
                <Paperclip className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                This card is empty
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {isAdmin
                  ? "Type a note, paste a link, or attach files in the bottom bar to add things to this card."
                  : "No items added to this card yet."}
              </p>
            </div>
          ) : (
            card.items.map((item, index) => {
              const createdDate = new Date(item.createdAt);
              const formattedTime = format(createdDate, "h:mm a");
              const isImg = isImageItem(item);
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col max-w-[92%] sm:max-w-[85%] self-start animate-in fade-in slide-in-from-bottom-1 duration-150"
                >
                  <div className="bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-sm space-y-2.5 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors w-full">
                    {/* 1. Image Format (Full WhatsApp-Style Presentation) */}
                    {isImg && item.filePath && (
                      <div className="space-y-2">
                        <div
                          onClick={() => setLightboxImage(item.filePath)}
                          className="relative rounded-2xl overflow-hidden cursor-zoom-in bg-slate-900/5 dark:bg-black/30 border border-slate-200/60 dark:border-slate-800 flex items-center justify-center"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.filePath}
                            alt={item.fileName || "Image"}
                            className="w-full max-h-[500px] object-contain rounded-2xl mx-auto block hover:opacity-95 transition-opacity"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 px-0.5">
                          <span className="truncate max-w-[180px] sm:max-w-xs font-medium">
                            {item.fileName || "Image"}
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setLightboxImage(item.filePath)}
                              className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-xs"
                            >
                              View Full
                            </button>
                            <a
                              href={item.filePath}
                              download={item.fileName || "image"}
                              className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-semibold"
                            >
                              <Download className="w-3 h-3" />
                              <span>Download</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. PDF Format */}
                    {!isImg && item.type === "pdf" && item.filePath && (
                      <div className="bg-red-50/60 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/60 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.fileName || "PDF Document"}
                            </p>
                            {item.fileSize && (
                              <span className="text-[10px] text-slate-400">
                                {(item.fileSize / 1024 / 1024).toFixed(2)} MB • PDF
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={item.filePath}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 flex items-center gap-1 shadow-sm"
                            title="View / Download PDF"
                          >
                            <Download className="w-3 h-3" />
                            <span className="hidden sm:inline">Open</span>
                          </a>
                        </div>
                      </div>
                    )}

                    {/* 3. Generic File Format */}
                    {!isImg && item.type === "file" && item.filePath && (
                      <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Paperclip className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {item.fileName || "Uploaded File"}
                            </p>
                            {item.fileSize && (
                              <span className="text-[10px] text-slate-400">
                                {(item.fileSize / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                          </div>
                        </div>

                        <a
                          href={item.filePath}
                          download={item.fileName || "download"}
                          className="p-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1 shadow-sm"
                        >
                          <Download className="w-3 h-3" />
                          <span className="hidden sm:inline">Get</span>
                        </a>
                      </div>
                    )}

                    {/* 4. Link Item (when not editing) */}
                    {!isEditing && item.type === "link" && item.content && (
                      <div className="bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <a
                            href={item.content}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1.5 break-all"
                          >
                            <span>{item.content}</span>
                            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          </a>
                        </div>
                      </div>
                    )}

                    {/* 5. Text Message / Caption - View Mode */}
                    {!isEditing && item.content && item.type !== "link" && (
                      <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </div>
                    )}

                    {/* 6. Inline Edit Mode */}
                    {isEditing && (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          rows={3}
                          className="w-full text-xs sm:text-sm bg-slate-50 dark:bg-slate-900 border-2 border-indigo-500 rounded-xl p-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
                          placeholder="Edit your message..."
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                              e.preventDefault();
                              handleSaveEdit(item.id);
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              handleCancelEdit();
                            }
                          }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-slate-400">
                            Ctrl+Enter to save • Esc to cancel
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={savingEdit}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              disabled={savingEdit}
                              className="px-3 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 shadow-sm transition-colors disabled:opacity-50"
                            >
                              {savingEdit ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer: Time & Action controls */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400">
                      <span>{formattedTime}</span>

                      <div className="flex items-center gap-1">
                        {/* Copy button */}
                        {item.content ? (
                          <button
                            type="button"
                            onClick={() => handleCopyText(item.content!, item.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Copy text"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        ) : item.filePath ? (
                          <button
                            type="button"
                            onClick={() => handleCopyText(item.filePath!, item.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            title="Copy link"
                          >
                            {copiedId === item.id ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        ) : null}

                        {/* Edit button (Admin only) */}
                        {isAdmin && !isEditing && (item.content || item.type === "text" || item.type === "link") && (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Edit message"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                        )}

                        {/* Delete button (Admin only) */}
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1 rounded text-slate-300 hover:text-rose-500 transition-colors"
                            title="Delete message"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* WhatsApp-Style Bottom Input Bar */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 bg-white dark:bg-slate-900 shrink-0">
          {!isAdmin ? (
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-4 py-2.5 text-xs">
              <span className="text-slate-500">
                Public Read Mode — You can view and download all files.
              </span>
              <button
                onClick={openPinModal}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Enter PIN to Add Items</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-2">
              {/* Attached file chip if selected */}
              {attachedFile && (
                <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-xl px-3 py-1.5 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {attachedFile.name}
                    </span>
                    <span className="text-slate-400 shrink-0">
                      ({(attachedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Input row */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAttachedFile(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-colors"
                  title="Attach file, image, or PDF"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message, note, or paste a link..."
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />

                <button
                  type="submit"
                  disabled={sending || (!inputText.trim() && !attachedFile)}
                  className="p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 transition-all active:scale-95"
                  title="Send to Card"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImage}
            alt="Enlarged view"
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
