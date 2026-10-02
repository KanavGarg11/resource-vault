"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAdmin } from "@/hooks/useAdmin";

export type ThemeCounts = Record<string, number>;

interface CardCountsContextType {
  counts: ThemeCounts;
  refreshCounts: () => Promise<void>;
  setCountsDirectly: (newCounts: ThemeCounts) => void;
}

const defaultCounts: ThemeCounts = {
  study: 0,
  "study-to-do": 0,
  schedules: 0,
  "to-do": 0,
  personal: 0,
};

const CardCountsContext = createContext<CardCountsContextType>({
  counts: defaultCounts,
  refreshCounts: async () => {},
  setCountsDirectly: () => {},
});

export function CardCountsProvider({ children }: { children: ReactNode }) {
  const { user } = useAdmin();
  const [counts, setCounts] = useState<ThemeCounts>(defaultCounts);

  const refreshCounts = useCallback(async () => {
    if (!user) {
      setCounts(defaultCounts);
      return;
    }
    try {
      const res = await fetch("/api/cards?countsOnly=true");
      if (res.ok) {
        const data = await res.json();
        if (data.countsByTheme) {
          setCounts(data.countsByTheme);
        }
      }
    } catch (err) {
      console.error("Failed to fetch theme card counts:", err);
    }
  }, [user]);

  useEffect(() => {
    refreshCounts();

    // 1. Instant sync when switching tabs or focusing window
    const onSync = () => {
      if (document.visibilityState === "visible") {
        refreshCounts();
      }
    };
    window.addEventListener("focus", onSync);
    document.addEventListener("visibilitychange", onSync);

    // 2. Custom event dispatched when cards are created or deleted
    const onCustomUpdate = () => {
      refreshCounts();
    };
    window.addEventListener("card-counts-updated", onCustomUpdate);

    // 3. Periodic background pulse every 12s
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshCounts();
      }
    }, 12000);

    return () => {
      window.removeEventListener("focus", onSync);
      document.removeEventListener("visibilitychange", onSync);
      window.removeEventListener("card-counts-updated", onCustomUpdate);
      clearInterval(timer);
    };
  }, [refreshCounts]);

  const setCountsDirectly = useCallback((newCounts: ThemeCounts) => {
    setCounts(newCounts);
  }, []);

  return (
    <CardCountsContext.Provider value={{ counts, refreshCounts, setCountsDirectly }}>
      {children}
    </CardCountsContext.Provider>
  );
}

export function useCardCounts() {
  return useContext(CardCountsContext);
}
