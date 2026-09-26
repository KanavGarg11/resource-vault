"use client";

import React from "react";
import { usePwa } from "@/components/providers/PwaProvider";
import { Download, Sparkles, X, Share, PlusSquare, Smartphone } from "lucide-react";

export function PwaInstallPrompt() {
  const {
    isInstallable,
    isInstalled,
    isIos,
    showBanner,
    showIosModal,
    setShowIosModal,
    promptInstall,
    dismissBanner,
  } = usePwa();

  if (isInstalled) return null;

  return (
    <>
      {/* Floating Install Banner */}
      {showBanner && isInstallable && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-indigo-200/80 dark:border-indigo-800/80 rounded-2xl p-4 shadow-2xl shadow-indigo-500/10 flex items-start gap-3.5">
            {/* App Icon */}
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Install LifeVault App
                </h4>
                <button
                  onClick={dismissBanner}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 -mr-1 rounded-lg transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Add to your home screen for full-screen experience and fast camera uploads.
              </p>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={promptInstall}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIos ? "How to Install" : "Install App"}</span>
                </button>

                <button
                  onClick={dismissBanner}
                  className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iOS Step-by-Step Installation Modal */}
      {showIosModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowIosModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
              <Smartphone className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Install on iPhone or iPad
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Apple requires installing PWAs directly through Safari with two quick taps:
            </p>

            <div className="mt-5 space-y-3.5">
              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    1. Tap Share
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tap the Share icon at the bottom of Safari.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    2. Add to Home Screen
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Scroll down and select <span className="font-semibold text-slate-700 dark:text-slate-300">Add to Home Screen</span>.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIosModal(false)}
              className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/25 transition-all"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
