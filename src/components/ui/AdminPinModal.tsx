"use client";

import { useState } from "react";
import { useAdmin } from "@/hooks/useAdmin";
import { Lock, X, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

export function AdminPinModal() {
  const { isPinModalOpen, closePinModal, login } = useAdmin();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isPinModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setLoading(true);
    setError(null);

    const result = await login(pin);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setPin("");
        closePinModal();
      }, 700);
    } else {
      setError(result.error || "Incorrect Admin PIN");
      setPin("");
    }
  };

  const handleKeypadPress = (num: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + num);
      setError(null);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closePinModal}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
            {success ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-bounce" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            Admin Mode Access
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
            Enter your Master PIN to unlock uploading, editing, and managing resources.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <div className="flex justify-center items-center gap-2 mb-2">
              <KeyRound className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={8}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError(null);
                }}
                placeholder="Enter PIN (Default: 1234)"
                autoFocus
                className="w-full text-center tracking-[0.3em] font-mono text-lg py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-rose-500 mt-2">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick On-Screen Keypad for fast mobile tap */}
          <div className="grid grid-cols-3 gap-2 pt-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleKeypadPress(num)}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-lg transition-colors active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 font-medium text-xs flex items-center justify-center transition-colors active:scale-95"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress("0")}
              className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-lg transition-colors active:scale-95"
            >
              0
            </button>
            <button
              type="submit"
              disabled={loading || pin.length === 0}
              className="py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm flex items-center justify-center transition-colors disabled:opacity-50 active:scale-95 shadow-md shadow-indigo-500/20"
            >
              {loading ? "..." : "Unlock"}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Public visitors can freely browse and download without a PIN.
          </p>
        </div>
      </div>
    </div>
  );
}
