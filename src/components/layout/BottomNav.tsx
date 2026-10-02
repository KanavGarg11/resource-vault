"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Clock, CalendarDays, CheckSquare, Sparkles } from "lucide-react";
import { useCardCounts } from "@/components/providers/CardCountsProvider";

interface BottomNavProps {
  onAddCardOpen?: () => void;
}

const THEME_TABS = [
  {
    label: "Study",
    themeKey: "study",
    href: "/theme/study",
    icon: BookOpen,
    activeColor: "text-blue-600 dark:text-blue-400",
    activeBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200/70 dark:border-blue-800/60",
    badgeColor: "bg-blue-600 text-white",
  },
  {
    label: "Study To-Do",
    themeKey: "study-to-do",
    href: "/theme/study-to-do",
    icon: Clock,
    activeColor: "text-amber-600 dark:text-amber-400",
    activeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/70 dark:border-amber-800/60",
    badgeColor: "bg-amber-600 text-white",
  },
  {
    label: "Schedules",
    themeKey: "schedules",
    href: "/theme/schedules",
    icon: CalendarDays,
    activeColor: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-50 dark:bg-violet-950/60 border-violet-200/70 dark:border-violet-800/60",
    badgeColor: "bg-violet-600 text-white",
  },
  {
    label: "To-Do",
    themeKey: "to-do",
    href: "/theme/to-do",
    icon: CheckSquare,
    activeColor: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/70 dark:border-emerald-800/60",
    badgeColor: "bg-emerald-600 text-white",
  },
  {
    label: "Personal",
    themeKey: "personal",
    href: "/theme/personal",
    icon: Sparkles,
    activeColor: "text-rose-600 dark:text-rose-400",
    activeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200/70 dark:border-rose-800/60",
    badgeColor: "bg-rose-600 text-white",
  },
];

export function BottomNav({ onAddCardOpen }: BottomNavProps) {
  const pathname = usePathname();
  const { counts } = useCardCounts();

  // Hide bottom nav on login or standalone public share views
  if (pathname === "/login" || pathname?.startsWith("/share/")) {
    return null;
  }

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-1.5 py-1.5 flex items-center justify-between gap-1 shadow-lg">
      {THEME_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        const count = counts[tab.themeKey] ?? 0;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-xl border transition-all duration-150 relative ${
              isActive
                ? `${tab.activeColor} ${tab.activeBg} font-bold shadow-xs`
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            }`}
          >
            <div className="relative flex items-center justify-center">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
              {/* Badge indicating number of cards in this theme on phone */}
              <span
                className={`absolute -top-1.5 -right-3 px-1 min-w-[15px] h-3.5 rounded-full text-[9px] font-extrabold flex items-center justify-center leading-none shadow-xs border ${
                  isActive
                    ? `${tab.badgeColor} border-white dark:border-slate-900`
                    : count > 0
                    ? "bg-slate-700 dark:bg-slate-200 text-white dark:text-slate-900 border-white dark:border-slate-900"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-white dark:border-slate-900"
                }`}
              >
                {count}
              </span>
            </div>
            <span className="text-[10px] tracking-tight leading-none text-center truncate max-w-full mt-0.5">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
