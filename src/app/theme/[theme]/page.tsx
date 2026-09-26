"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardTheme, THEME_CONFIG } from "@/lib/types";
import { CardGridItem } from "@/components/cards/CardGridItem";
import { CardThreadModal } from "@/components/cards/CardThreadModal";
import { CreateCardModal } from "@/components/cards/CreateCardModal";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAdmin } from "@/hooks/useAdmin";
import {
  BookOpen,
  Clock,
  CalendarDays,
  CheckSquare,
  Sparkles,
  Plus,
  Search,
  X,
  Loader2,
  Layers,
  LogIn,
} from "lucide-react";

const VALID_THEMES: CardTheme[] = [
  "study",
  "study-to-do",
  "schedules",
  "to-do",
  "personal",
];

const THEME_ICONS: Record<CardTheme, any> = {
  study: BookOpen,
  "study-to-do": Clock,
  schedules: CalendarDays,
  "to-do": CheckSquare,
  personal: Sparkles,
};

const THEME_DESCRIPTIONS: Record<CardTheme, string> = {
  study: "Course materials, lecture notes, textbook chapters, and reference PDFs",
  "study-to-do": "Academic assignments, pending problem sheets, homework, and lab work",
  schedules: "Class timetables, exam dates, holiday calendars, and academic timelines",
  "to-do": "General tasks, errands, checklists, and personal reminders",
  personal: "Saved jokes for friends, shopping links, casual thoughts, and memes",
};

export default function ThemePage() {
  const params = useParams();
  const rawTheme = params.theme as string;
  const theme = rawTheme as CardTheme;

  const { user, isAdmin, openPinModal } = useAdmin();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const isValidTheme = VALID_THEMES.includes(theme);

  const fetchThemeCards = async (query = searchQuery) => {
    if (!isValidTheme) return;
    try {
      const q = query.trim() ? `&search=${encodeURIComponent(query.trim())}` : "";
      const res = await fetch(`/api/cards?theme=${theme}${q}`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.cards || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isValidTheme) {
      fetchThemeCards();
    }
  }, [theme, user]);

  if (!isValidTheme) {
    notFound();
  }

  const themeConfig = THEME_CONFIG[theme];
  const Icon = THEME_ICONS[theme] || Layers;
  const themeDesc = THEME_DESCRIPTIONS[theme];

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    fetchThemeCards(val);
  };

  const handleCardDeleted = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCardId === id) setSelectedCardId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl ${themeConfig.bg} ${themeConfig.color} border ${themeConfig.border} flex items-center justify-center shrink-0 shadow-inner`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white capitalize">
                {themeConfig.label}
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                {cards.length} Card{cards.length === 1 ? "" : "s"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{themeDesc}</p>
          </div>
        </div>

        {/* Add Card Button for this theme */}
        <button
          onClick={() => {
            if (!user) openPinModal();
            else setIsCreateModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all self-start sm:self-auto shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Add {themeConfig.label} Card</span>
        </button>
      </div>

      {/* Theme Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder={`Search ${themeConfig.label} card titles, notes, and files...`}
          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => handleSearchChange("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
          <span>Loading {themeConfig.label} cards...</span>
        </div>
      ) : !user ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Sign In to View Your {themeConfig.label} Cards
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your resources are private to your account. Sign in to view and create cards in this category.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Vault</span>
          </Link>
        </div>
      ) : cards.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {searchQuery
              ? `No ${themeConfig.label} cards match your search`
              : `No cards in ${themeConfig.label} yet`}
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? "Try clearing your search query."
              : `Click "+ Add ${themeConfig.label} Card" above to start your first self-chat card!`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => (
            <CardGridItem
              key={card.id}
              card={card}
              onClick={() => setSelectedCardId(card.id)}
              onDelete={handleCardDeleted}
            />
          ))}
        </div>
      )}

      {/* Card Thread Modal */}
      <CardThreadModal
        cardId={selectedCardId}
        onClose={() => setSelectedCardId(null)}
        onCardUpdated={() => fetchThemeCards()}
        onCardDeleted={handleCardDeleted}
      />

      {/* Create Card Modal with preselected theme */}
      <CreateCardModal
        isOpen={isCreateModalOpen}
        defaultTheme={theme}
        onClose={() => setIsCreateModalOpen(false)}
        onCardCreated={() => fetchThemeCards()}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav onAddCardOpen={() => setIsCreateModalOpen(true)} />
    </div>
  );
}
