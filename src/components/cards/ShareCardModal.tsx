"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Share2,
  Copy,
  Check,
  Globe,
  Lock,
  ExternalLink,
  Loader2,
  ShieldCheck,
} from "lucide-react";

interface ShareCardModalProps {
  cardId: string;
  cardTitle: string;
  isOpen: boolean;
  onClose: () => void;
  initialIsPublic?: boolean;
  initialShareToken?: string | null;
  onShareUpdated?: (isPublic: boolean, shareToken: string | null) => void;
}

export function ShareCardModal({
  cardId,
  cardTitle,
  isOpen,
  onClose,
  initialIsPublic = false,
  initialShareToken = null,
  onShareUpdated,
}: ShareCardModalProps) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  useEffect(() => {
    setIsPublic(initialIsPublic);
    setShareToken(initialShareToken);
  }, [initialIsPublic, initialShareToken]);

  if (!isOpen) return null;

  const shareUrl = shareToken ? `${origin}/share/${shareToken}` : "";

  const handleToggleShare = async () => {
    setLoading(true);
    const nextState = !isPublic;

    try {
      const res = await fetch(`/api/cards/${cardId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: nextState }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsPublic(data.isPublic);
        setShareToken(data.shareToken);
        if (onShareUpdated) {
          onShareUpdated(data.isPublic, data.shareToken);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update share status");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating share status");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Share Vault Card
            </h3>
            <p className="text-xs text-slate-400 truncate max-w-[260px]">
              "{cardTitle}"
            </p>
          </div>
        </div>

        {/* Share Toggle Section */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isPublic
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-500"
              }`}
            >
              {isPublic ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {isPublic ? "Public Link Enabled" : "Card is Private"}
              </p>
              <p className="text-[11px] text-slate-400">
                {isPublic
                  ? "Anyone with link can view notes & files"
                  : "Only you can see this card"}
              </p>
            </div>
          </div>

          <button
            onClick={handleToggleShare}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isPublic ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center w-full h-full">
                <Loader2 className="w-3 h-3 text-white animate-spin" />
              </span>
            ) : (
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isPublic ? "translate-x-5" : "translate-x-0"
                }`}
              />
            )}
          </button>
        </div>

        {/* Link Box (when enabled) */}
        {isPublic && shareUrl && (
          <div className="mt-4 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-slate-100 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 select-all focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-500/20 active:scale-95"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Preview public view</span>
              </a>

              <span className="text-[11px] text-slate-400">Read-only link</span>
            </div>
          </div>
        )}

        {/* Privacy Assurance Disclaimer */}
        <div className="mt-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-300">Total Privacy Isolation:</strong>{" "}
            Only the notes, links, and documents inside this specific card are shared. Your other vault cards, personal timetable, and account data remain completely hidden.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
