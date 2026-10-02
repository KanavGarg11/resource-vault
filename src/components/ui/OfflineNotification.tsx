"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw, X } from "lucide-react";

export function OfflineNotification() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    // Initial check
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOffline = () => {
      setIsOffline(true);
      setShowReconnected(false);
      setDismissed(false);
    };

    const handleOnline = () => {
      setIsOffline(false);
      setShowReconnected(true);
      setDismissed(false);

      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3500);

      return () => clearTimeout(timer);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const handleRetry = async () => {
    setChecking(true);
    try {
      // Attempt a lightweight fetch with cache busting to test true internet connectivity
      const res = await fetch(`/favicon.png?t=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      if (res.ok) {
        setIsOffline(false);
        setShowReconnected(true);
        setTimeout(() => setShowReconnected(false), 3500);
      } else {
        setIsOffline(true);
      }
    } catch {
      setIsOffline(true);
    } finally {
      setChecking(false);
    }
  };

  // If online and not showing the brief "Back Online" message, or if user dismissed, render nothing
  if (!isOffline && !showReconnected) return null;
  if (isOffline && dismissed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] sm:w-auto animate-in slide-in-from-top-3 fade-in duration-200 pointer-events-auto"
    >
      {isOffline ? (
        // Offline Pop-up Notification
        <div className="flex items-center gap-3 bg-slate-950/95 text-white border-2 border-amber-500/80 rounded-2xl px-4 py-3 shadow-2xl shadow-amber-950/40 backdrop-blur-xl">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 relative">
            <WifiOff className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          </div>

          <div className="min-w-0 pr-1">
            <p className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>You&apos;re currently offline</span>
            </p>
            <p className="text-[11px] text-slate-300 truncate">
              No internet connection. Changes will sync once back online.
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            <button
              onClick={handleRetry}
              disabled={checking}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-[11px] transition-all active:scale-95 disabled:opacity-50"
              title="Test internet connection"
            >
              <RefreshCw className={`w-3 h-3 ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Checking..." : "Retry"}</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              title="Dismiss banner"
              aria-label="Dismiss offline notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Reconnected Success Pop-up Notification
        <div className="flex items-center gap-2.5 bg-emerald-600/95 text-white border border-emerald-400/60 rounded-2xl px-4 py-2.5 shadow-2xl shadow-emerald-950/30 backdrop-blur-xl">
          <div className="w-7 h-7 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-extrabold tracking-tight">Back Online!</p>
            <p className="text-[10px] text-emerald-100">
              Connection restored. Syncing your cards in real time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
