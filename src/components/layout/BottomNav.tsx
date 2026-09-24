"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, CalendarDays, CheckSquare, Plus } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

interface BottomNavProps {
  onAddCardOpen: () => void;
}

export function BottomNav({ onAddCardOpen }: BottomNavProps) {
  const pathname = usePathname();
  const { isAdmin, openPinModal } = useAdmin();

  const handlePlusClick = () => {
    if (!isAdmin) {
      openPinModal();
    } else {
      onAddCardOpen();
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-3 py-2 flex items-center justify-around shadow-lg">
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          pathname === "/"
            ? "text-indigo-600 dark:text-indigo-400 font-bold"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </Link>

      {/* Study */}
      <Link
        href="/theme/study"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          pathname === "/theme/study"
            ? "text-indigo-600 dark:text-indigo-400 font-bold"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px]">Study</span>
      </Link>

      {/* Center Floating Add Card Button */}
      <button
        onClick={handlePlusClick}
        className="flex flex-col items-center -mt-6 group"
        aria-label="Add a Card"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
          {isAdmin ? "Add Card" : "Unlock"}
        </span>
      </button>

      {/* Schedules */}
      <Link
        href="/theme/schedules"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          pathname === "/theme/schedules"
            ? "text-indigo-600 dark:text-indigo-400 font-bold"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <CalendarDays className="w-5 h-5" />
        <span className="text-[10px]">Schedules</span>
      </Link>

      {/* To-Do */}
      <Link
        href="/theme/to-do"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          pathname === "/theme/to-do"
            ? "text-indigo-600 dark:text-indigo-400 font-bold"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <CheckSquare className="w-5 h-5" />
        <span className="text-[10px]">To-Do</span>
      </Link>
    </nav>
  );
}
