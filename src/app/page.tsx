"use client";

import { useState, useEffect } from "react";
import { Card } from "@/lib/types";
import { TodayScheduleWidget } from "@/components/dashboard/TodayScheduleWidget";
import { CardGridItem } from "@/components/cards/CardGridItem";
import { CardThreadModal } from "@/components/cards/CardThreadModal";
import { CreateCardModal } from "@/components/cards/CreateCardModal";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAdmin } from "@/hooks/useAdmin";
import { Search, Plus, X, Layers, Loader2 } from "lucide-react";

export default function HomePage() {
  const { isAdmin, openPinModal } = useAdmin();

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
  }, []);

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
      {/* 1. Global Search Bar */}
      <section>
        <div className="glass-panel rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/90 dark:border-slate-800/90">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search across card titles, notes, links, and filenames..."
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
              if (!isAdmin) {
                openPinModal();
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{isAdmin ? "+ Add a Card" : "Unlock Admin to Add Cards"}</span>
          </button>
        </div>
      </section>

      {/* 3. Today's Timetable Widget First */}
      <section>
        <TodayScheduleWidget />
      </section>

      {/* 4. Latest Added Cards Grid (Last added first, all themes) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Latest Added Cards
              </h2>
              <p className="text-xs text-slate-400">
                All topic cards across themes — click any card to view its WhatsApp-style thread
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {cards.length} card{cards.length === 1 ? "" : "s"}
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Loading cards...</span>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              {searchQuery ? "No matching cards found" : "No cards created yet"}
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
