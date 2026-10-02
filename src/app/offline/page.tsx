"use client";

import React, { useState, useEffect } from "react";
import { WifiOff, RefreshCw, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  const [checking, setChecking] = useState(false);
  const [reconnectFailed, setReconnectFailed] = useState(false);

  useEffect(() => {
    // When internet connection is restored, automatically redirect to home
    const handleOnline = () => {
      window.location.href = "/";
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  const handleRetry = async () => {
    setChecking(true);
    setReconnectFailed(false);
    try {
      const res = await fetch(`/favicon.png?t=${Date.now()}`, {
        method: "HEAD",
        cache: "no-store",
      });
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      setReconnectFailed(true);
    } catch {
      setReconnectFailed(true);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Brand Icon & Offline Badge */}
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-500/30 text-amber-500 flex items-center justify-center shadow-xl shadow-amber-500/10 mx-auto">
            <WifiOff className="w-9 h-9" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-800 border-2 border-white dark:border-slate-700 flex items-center justify-center text-white shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          </div>
        </div>

        {/* Heading & Explanation */}
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            You&apos;re Offline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            LifeVault couldn&apos;t connect to the internet. We&apos;ll automatically reload your vault as soon as connection is restored.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1 space-y-2">
          <button
            onClick={handleRetry}
            disabled={checking}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
            <span>{checking ? "Checking connection..." : "Try Reconnecting"}</span>
          </button>

          {reconnectFailed && (
            <p className="text-xs font-semibold text-rose-500 dark:text-rose-400 animate-in fade-in">
              Still unable to reach the internet. Please check your network.
            </p>
          )}
        </div>

        {/* Connectivity Troubleshooting Checklist */}
        <div className="rounded-2xl p-4 bg-slate-50/90 dark:bg-slate-900/60 border border-slate-200/90 dark:border-slate-800 text-left space-y-2.5">
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Quick Connectivity Checks:
          </p>
          <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Ensure Wi-Fi or mobile data is turned on</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Verify that Airplane Mode is turned off</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Screen will automatically refresh once online</span>
            </li>
          </ul>
        </div>

        {/* Back to Home Link */}
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
