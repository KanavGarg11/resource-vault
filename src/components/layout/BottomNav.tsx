"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Clock, CalendarDays, CheckSquare, Sparkles } from "lucide-react";

interface BottomNavProps {
  onAddCardOpen?: () => void;
}

const THEME_TABS = [
  {
    label: "Study",
    href: "/theme/study",
    icon: BookOpen,
    activeColor: "text-blue-600 dark:text-blue-400",
    activeBg: "bg-blue-50 dark:bg-blue-950/60 border-blue-200/70 dark:border-blue-800/60",
  },
  {
    label: "Study To-Do",
    href: "/theme/study-to-do",
    icon: Clock,
    activeColor: "text-amber-600 dark:text-amber-400",
    activeBg: "bg-amber-50 dark:bg-amber-950/60 border-amber-200/70 dark:border-amber-800/60",
  },
  {
    label: "Schedules",
    href: "/theme/schedules",
    icon: CalendarDays,
    activeColor: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-50 dark:bg-violet-950/60 border-violet-200/70 dark:border-violet-800/60",
  },
  {
    label: "To-Do",
    href: "/theme/to-do",
    icon: CheckSquare,
    activeColor: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/70 dark:border-emerald-800/60",
  },
  {
    label: "Personal",
    href: "/theme/personal",
    icon: Sparkles,
    activeColor: "text-rose-600 dark:text-rose-400",
    activeBg: "bg-rose-50 dark:bg-rose-950/60 border-rose-200/70 dark:border-rose-800/60",
  },
];

export function BottomNav({ onAddCardOpen }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/80 dark:border-slate-800/80 px-1.5 py-1.5 flex items-center justify-between gap-1 shadow-lg">
      {THEME_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1 py-1.5 px-0.5 rounded-xl border transition-all duration-150 ${
              isActive
                ? `${tab.activeColor} ${tab.activeBg} font-bold shadow-sm`
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
            <span className="text-[10px] tracking-tight leading-none text-center truncate max-w-full">
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
