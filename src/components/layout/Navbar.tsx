"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/hooks/useAdmin";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import {
  Compass,
  BookOpen,
  Clock,
  CalendarDays,
  CheckSquare,
  Sparkles,
  LogOut,
  LogIn,
  Download,
} from "lucide-react";
import { usePwa } from "@/components/providers/PwaProvider";
import { useCardCounts } from "@/components/providers/CardCountsProvider";

const THEME_NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: Compass, themeKey: null },
  { label: "Study", href: "/theme/study", icon: BookOpen, themeKey: "study" },
  { label: "Study To-Do", href: "/theme/study-to-do", icon: Clock, themeKey: "study-to-do" },
  { label: "Schedules", href: "/theme/schedules", icon: CalendarDays, themeKey: "schedules" },
  { label: "To-Do", href: "/theme/to-do", icon: CheckSquare, themeKey: "to-do" },
  { label: "Personal", href: "/theme/personal", icon: Sparkles, themeKey: "personal" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAdmin();
  const { isInstallable, isInstalled, promptInstall } = usePwa();
  const { counts } = useCardCounts();

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white block">
              LifeVault
            </span>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Organized Self-Chat Vault
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links for the 5 Themes */}
        <nav className="hidden lg:flex items-center gap-1">
          {THEME_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const count = item.themeKey ? counts[item.themeKey] : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {count !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold leading-none transition-colors ${
                      isActive
                        ? "bg-white/25 text-white"
                        : count > 0
                        ? "bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50"
                        : "bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons: Install App, Theme Toggle, & User Profile / Login */}
        <div className="flex items-center gap-2">
          {isInstallable && !isInstalled && (
            <button
              onClick={promptInstall}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-bold transition-all active:scale-95"
              title="Install LifeVault App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install App</span>
            </button>
          )}

          {/* Theme Toggle (Dark / Light Mode) */}
          <ThemeToggle />

          {/* Credentials Button (Avatar + Log Out bubble or Sign In) on right-most side */}
          {user ? (
            <div className="flex items-center gap-1.5 bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 pl-2.5 pr-1.5 py-1 rounded-2xl shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || "User Avatar"}
                  className="w-5 h-5 rounded-full object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
              )}
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[120px] truncate hidden sm:inline">
                {user.name || user.email?.split("@")[0]}
              </span>
              <button
                onClick={() => logout()}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ml-0.5"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
