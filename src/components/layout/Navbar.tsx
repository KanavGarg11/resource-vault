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
  Lock,
  LogOut,
  Menu,
  X,
  Trash2,
} from "lucide-react";
import { useState } from "react";

const THEME_NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: Compass },
  { label: "Study", href: "/theme/study", icon: BookOpen },
  { label: "Study To-Do", href: "/theme/study-to-do", icon: Clock },
  { label: "Schedules", href: "/theme/schedules", icon: CalendarDays },
  { label: "To-Do", href: "/theme/to-do", icon: CheckSquare },
  { label: "Personal", href: "/theme/personal", icon: Sparkles },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAdmin, openPinModal, logout } = useAdmin();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                LifeVault
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                Cards
              </span>
            </div>
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
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons: Admin Login/Logout & Theme */}
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 pl-2.5 pr-1.5 py-1 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Admin
                </span>
              </div>

              <button
                onClick={() => logout()}
                className="p-1 rounded-lg text-emerald-600 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors ml-1"
                title="Lock / Exit Admin Mode"
                aria-label="Exit Admin"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openPinModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Unlock Admin Mode to Add/Edit Cards"
            >
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Admin Mode</span>
            </button>
          )}

          <ThemeToggle />

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
          {THEME_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
