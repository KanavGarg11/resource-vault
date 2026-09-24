"use client";

import { useState, useEffect } from "react";
import { TimetableEntry } from "@/lib/types";
import { Clock, MapPin, User, ChevronRight, Calendar } from "lucide-react";
import Link from "next/link";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function TodayScheduleWidget() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current day name (default to Monday if weekend)
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const todayName =
    currentDayIndex >= 1 && currentDayIndex <= 5
      ? DAYS[currentDayIndex - 1]
      : "Monday";

  const [activeDay, setActiveDay] = useState(todayName);

  useEffect(() => {
    fetchTimetable(activeDay);
  }, [activeDay]);

  const fetchTimetable = async (day: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/timetable?day=${day}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Daily Class Schedule
            </h3>
            <p className="text-[11px] text-slate-400">Timetable at a glance</p>
          </div>
        </div>

        <Link
          href="/theme/schedules"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-0.5"
        >
          <span>Full Week</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {DAYS.map((day) => {
          const isSelected = activeDay === day;
          const isRealToday = todayName === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              {isRealToday && (
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block align-middle" />
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Items List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Loading classes...
          </div>
        ) : entries.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Calendar className="w-6 h-6 mx-auto text-slate-400 mb-1" />
            <p className="text-xs text-slate-500">No scheduled classes for {activeDay}. Enjoy your break!</p>
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {item.subject}
                  </span>
                  {item.code && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                      {item.code}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                  {item.room && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{item.room}</span>
                    </span>
                  )}
                  {item.professor && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{item.professor}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Time Badge */}
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 block">
                  {item.startTime}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  to {item.endTime}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
