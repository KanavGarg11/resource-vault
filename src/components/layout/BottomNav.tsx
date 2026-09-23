"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, BookOpen, CheckSquare, Image as ImageIcon, Plus } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

interface BottomNavProps {
  onQuickDropOpen: () => void;
}

export function BottomNav({ onQuickDropOpen }: BottomNavProps) {
  const pathname = usePathname();
  const { isAdmin, openPinModal } = useAdmin();

  const handlePlusClick = () => {
    if (!isAdmin) {
      openPinModal();
    } else {
      onQuickDropOpen();
    }
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Compass },
    { label: "Study", href: "/study", icon: BookOpen },
    { label: "Deadlines", href: "/assignments", icon: CheckSquare },
    { label: "Media", href: "/media", icon: ImageIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-3 py-2 flex items-center justify-around shadow-lg">
      {/* Home */}
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          pathname === "/"
            ? "text-indigo-600 dark:text-indigo-400 font-medium"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <Compass className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </Link>

      {/* Study Vault */}
      <Link
        href="/study"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          pathname === "/study"
            ? "text-indigo-600 dark:text-indigo-400 font-medium"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px]">Study</span>
      </Link>

      {/* Center Floating Quick Drop Button */}
      <button
        onClick={handlePlusClick}
        className="flex flex-col items-center -mt-6 group"
        aria-label="Quick Drop"
      >
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </div>
        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
          {isAdmin ? "Drop" : "Unlock"}
        </span>
      </button>

      {/* Deadlines */}
      <Link
        href="/assignments"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          pathname === "/assignments"
            ? "text-indigo-600 dark:text-indigo-400 font-medium"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <CheckSquare className="w-5 h-5" />
        <span className="text-[10px]">Tasks</span>
      </Link>

      {/* Media Vault */}
      <Link
        href="/media"
        className={`flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-colors ${
          pathname === "/media"
            ? "text-indigo-600 dark:text-indigo-400 font-medium"
            : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <ImageIcon className="w-5 h-5" />
        <span className="text-[10px]">Media</span>
      </Link>
    </nav>
  );
}
