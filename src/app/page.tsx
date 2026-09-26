"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/lib/types";
import { TodayScheduleWidget } from "@/components/dashboard/TodayScheduleWidget";
import { CardGridItem } from "@/components/cards/CardGridItem";
import { CardThreadModal } from "@/components/cards/CardThreadModal";
import { CreateCardModal } from "@/components/cards/CreateCardModal";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAdmin } from "@/hooks/useAdmin";
import { Search, Plus, X, Layers, Loader2, Sparkles, LogIn } from "lucide-react";

export default function HomePage() {
  const { user, isAdmin, openPinModal } = useAdmin();

  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCards = async (query = searchQuery) => {
    try {
      const url = query.trim()
        ? `/api/cards?search=${encodeURIComponent(query.trim())}`
        : `/api/cards`;
      const res = await fetch(url);
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
    fetchCards();
  }, [user]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    fetchCards(val);
  };

  const handleCardDeleted = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id));
    if (selectedCardId === id) setSelectedCardId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-7">
      {/* 0. Public Welcome Banner (If user is not signed in) */}
      {!user && (
        <section>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 p-6 sm:p-10 text-white shadow-xl shadow-indigo-500/10">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100 border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Personal Student Resource Hub</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                Your Private Self-Chat Vault & Smart Timetable
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
                Transform chaotic WhatsApp notes into organized topic cards. Store course notes, assignment files, links, and track live class routines in your own private vault.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-2xl bg-white text-indigo-700 font-extrabold text-xs sm:text-sm shadow-lg hover:bg-slate-100 transition-all active:scale-95"
                >
                  <LogIn className="w-4 h-4 text-indigo-600" />
                  <span>Get Started / Sign In Free</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 1. Global Search Bar */}
      <section>
        <div className="glass-panel rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/90 dark:border-slate-800/90">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search across your card titles, notes, links, and filenames..."
              className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
              <span>
                Found <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{cards.length}</strong> matching card(s)
              </span>
              <button
                onClick={() => handleSearchChange("")}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. "Add a Card" Action Bar */}
      <section>
        <div className="glass-panel rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200/90 dark:border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              Create a Topic Card
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Each card mimics a WhatsApp self-chat. Drop notes, files, links, or images anytime in linear order.
            </p>
          </div>

          <button
            onClick={() => {
              if (!user) {
                openPinModal();
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{user ? "+ Add a Card" : "Sign In to Add Cards"}</span>
          </button>
        </div>
      </section>

      {/* 3. Today's Timetable Widget */}
      <section>
        <TodayScheduleWidget />
      </section>

      {/* 4. Latest Added Cards Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
              Your Cards
            </h2>
            <p className="text-xs text-slate-400">
              {user
                ? "Organized in chronological order. Click any card to expand into its thread."
                : "Sign in to view and manage your private cards."}
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {cards.length} {cards.length === 1 ? "Card" : "Cards"}
          </span>
        </div>

        {loading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Loading cards...</span>
          </div>
        ) : !user ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Sign In to Access Your Private Cards
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Each user has their own private space. Sign in with Google or create an account to start saving cards.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Create Account</span>
            </Link>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {searchQuery ? "No matching cards found" : "No cards in your vault yet"}
            </h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? "Try searching for a different keyword or topic."
                : "Click '+ Add a Card' above to create your first card (e.g. OS Lecture Notes, Shopping Wishlist)."}
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
      </section>

      {/* Card Thread WhatsApp-Style Modal */}
      <CardThreadModal
        cardId={selectedCardId}
        onClose={() => setSelectedCardId(null)}
        onCardUpdated={() => fetchCards()}
        onCardDeleted={handleCardDeleted}
      />

      {/* Create Card Modal */}
      <CreateCardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCardCreated={() => fetchCards()}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNav onAddCardOpen={() => setIsCreateModalOpen(true)} />
    </div>
  );
}
