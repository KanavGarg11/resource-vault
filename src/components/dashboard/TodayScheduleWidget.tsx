"use client";

import { useState, useEffect } from "react";
import { TimetableEntry } from "@/lib/types";
import { useAdmin } from "@/hooks/useAdmin";
import {
  Clock,
  MapPin,
  User,
  ChevronRight,
  Calendar,
  Plus,
  Trash2,
  X,
  Loader2,
  Radio,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { WeeklyScheduleModal } from "./WeeklyScheduleModal";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Parses time strings like "09:00 AM", "9:00am", "14:30", "9:30" into total minutes from midnight (0 - 1439).
 */
function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?:\s*([aApP][mM]))?$/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridian = match[3]?.toUpperCase();

  if (meridian === "PM" && hours < 12) {
    hours += 12;
  } else if (meridian === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

/**
 * Formats duration in minutes into a friendly string like "25m" or "1h 15m".
 */
function formatDuration(minutes: number): string {
  if (minutes < 1) return "less than a min";
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function TodayScheduleWidget() {
  const { isAdmin, openPinModal } = useAdmin();

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Update clock every 30 seconds for real-time live class detection
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Determine current day name (Mon-Sat, default to Mon on Sunday)
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const todayName =
    currentDayIndex >= 1 && currentDayIndex <= 6
      ? DAYS[currentDayIndex - 1]
      : "Monday";

  const [activeDay, setActiveDay] = useState(todayName);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [formDay, setFormDay] = useState(activeDay);
  const [formSubject, setFormSubject] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formRoom, setFormRoom] = useState("");
  const [formProfessor, setFormProfessor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTimetable(activeDay);
  }, [activeDay, isAdmin]);

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

  const handleOpenAddModal = (day = activeDay) => {
    if (!isAdmin) {
      openPinModal();
      return;
    }
    setFormDay(day);
    setFormSubject("");
    setFormCode("");
    setFormStartTime("");
    setFormEndTime("");
    setFormRoom("");
    setFormProfessor("");
    setIsAddModalOpen(true);
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    if (!formSubject.trim() || !formStartTime.trim() || !formEndTime.trim()) {
      alert("Please fill in Subject, Start Time, and End Time");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: formDay,
          subject: formSubject.trim(),
          code: formCode.trim() || null,
          startTime: formStartTime.trim(),
          endTime: formEndTime.trim(),
          room: formRoom.trim() || null,
          professor: formProfessor.trim() || null,
        }),
      });

      if (res.ok) {
        setIsAddModalOpen(false);
        setActiveDay(formDay);
        await fetchTimetable(formDay);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to add class schedule");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding class schedule");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: string, subject: string) => {
    if (!isAdmin) return;
    if (!confirm(`Delete "${subject}" from ${activeDay}'s schedule?`)) return;

    try {
      const res = await fetch(`/api/timetable/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchTimetable(activeDay);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Live Status Calculations ---
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const isViewingToday = activeDay === todayName;

  let liveClass: TimetableEntry | null = null;
  let nextClass: TimetableEntry | null = null;
  let allDoneToday = false;

  if (isViewingToday && entries.length > 0) {
    // Sort entries chronologically by parsed start time
    const sorted = [...entries].sort((a, b) => {
      const minA = parseTimeToMinutes(a.startTime) ?? 0;
      const minB = parseTimeToMinutes(b.startTime) ?? 0;
      return minA - minB;
    });

    for (const item of sorted) {
      const startMin = parseTimeToMinutes(item.startTime);
      const endMin = parseTimeToMinutes(item.endTime);

      if (startMin !== null && endMin !== null) {
        if (currentMinutes >= startMin && currentMinutes < endMin) {
          liveClass = item;
          break;
        } else if (currentMinutes < startMin && !nextClass) {
          nextClass = item;
        }
      }
    }

    if (!liveClass && !nextClass && sorted.length > 0) {
      const lastClass = sorted[sorted.length - 1];
      const lastEnd = parseTimeToMinutes(lastClass.endTime);
      if (lastEnd !== null && currentMinutes >= lastEnd) {
        allDoneToday = true;
      }
    }
  }

  const liveClassEndMin = liveClass ? parseTimeToMinutes(liveClass.endTime) : null;
  const liveRemainingMins =
    liveClassEndMin !== null ? Math.max(0, liveClassEndMin - currentMinutes) : null;

  const nextClassStartMin = nextClass ? parseTimeToMinutes(nextClass.startTime) : null;
  const nextStartInMins =
    nextClassStartMin !== null ? Math.max(0, nextClassStartMin - currentMinutes) : null;

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
            <p className="text-[11px] text-slate-400">Timetable & live class tracker</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsWeeklyModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-bold text-xs transition-all active:scale-95 shadow-xs"
            title="View entire week timetable and export as PNG or PDF"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Weekly Grid & Export</span>
            <span className="sm:hidden">Weekly</span>
          </button>

          {isAdmin ? (
            <button
              onClick={() => handleOpenAddModal(activeDay)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm shadow-indigo-500/20 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Add Class</span>
            </button>
          ) : (
            <button
              onClick={openPinModal}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Admin Login
            </button>
          )}

          <Link
            href="/theme/schedules"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5 ml-1"
          >
            <span>Schedules</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* --- Option A: Smart Live Status Banner --- */}
      {/* 1. Live Class Happening Right Now */}
      {isViewingToday && liveClass && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/25">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Live Class Now
                </span>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {liveClass.subject}
                </h4>
                {liveClass.code && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {liveClass.code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300 mt-1 flex-wrap">
                {liveClass.room && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{liveClass.room}</span>
                  </span>
                )}
                {liveClass.professor && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>{liveClass.professor}</span>
                  </span>
                )}
                <span className="text-slate-400">
                  • {liveClass.startTime} – {liveClass.endTime}
                </span>
              </div>
            </div>
          </div>

          {liveRemainingMins !== null && (
            <div className="self-end sm:self-auto shrink-0 bg-white dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1.5 rounded-xl shadow-xs text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Time Left
              </span>
              <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                {liveRemainingMins > 0 ? formatDuration(liveRemainingMins) : "Ending now"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* 2. Break / Up Next Class */}
      {isViewingToday && !liveClass && nextClass && (
        <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/70 px-2 py-0.5 rounded-md">
                  Up Next
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                  {nextClass.subject}
                </span>
                {nextClass.code && (
                  <span className="text-[10px] font-mono text-slate-400">({nextClass.code})</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                {nextClass.room && <span>{nextClass.room} • </span>}
                <span>Starts at {nextClass.startTime}</span>
                {nextStartInMins !== null && (
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    (in {formatDuration(nextStartInMins)})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. All Classes Done Today */}
      {isViewingToday && !liveClass && !nextClass && allDoneToday && (
        <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>All scheduled classes for today are completed! Enjoy your free time 🎉</span>
        </div>
      )}

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
                  ? "bg-indigo-600 text-white shadow-sm font-bold"
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

      {/* Horizontal Left-to-Right Schedule Strip */}
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-0.5 scrollbar-thin">
        {loading ? (
          <div className="py-6 w-full text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Loading classes...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-3.5 px-4 w-full text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>No scheduled classes for <strong>{activeDay}</strong>.</span>
            </div>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => handleOpenAddModal(activeDay)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all shrink-0 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Add Class</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openPinModal}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold shrink-0"
              >
                Admin PIN to set
              </button>
            )}
          </div>
        ) : (
          [...entries]
            .sort((a, b) => {
              const minA = parseTimeToMinutes(a.startTime) ?? 0;
              const minB = parseTimeToMinutes(b.startTime) ?? 0;
              return minA - minB;
            })
            .map((item) => {
              const startMin = parseTimeToMinutes(item.startTime);
              const endMin = parseTimeToMinutes(item.endTime);
              const isItemLive =
                isViewingToday &&
                startMin !== null &&
                endMin !== null &&
                currentMinutes >= startMin &&
                currentMinutes < endMin;
              const isItemPast =
                isViewingToday && endMin !== null && currentMinutes >= endMin;

              return (
                <div
                  key={item.id}
                  className={`group min-w-[210px] sm:min-w-[240px] max-w-[260px] shrink-0 p-3.5 rounded-2xl transition-all flex flex-col justify-between space-y-2.5 ${
                    isItemLive
                      ? "bg-emerald-50/70 dark:bg-emerald-950/40 border-2 border-emerald-500 dark:border-emerald-500/90 ring-2 ring-emerald-500/20 shadow-md"
                      : isItemPast
                      ? "bg-slate-50/80 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/60 opacity-60 hover:opacity-100"
                      : "bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs"
                  }`}
                >
                  {/* 1. Card Top: Time and Status Badges */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span
                      className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                        isItemLive
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/60"
                      }`}
                    >
                      {item.startTime} – {item.endTime}
                    </span>

                    <div className="flex items-center gap-1">
                      {isItemLive && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white bg-emerald-600 px-2 py-0.5 rounded-full shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />
                          Live
                        </span>
                      )}
                      {isItemPast && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          ✓ Done
                        </span>
                      )}

                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDeleteEntry(item.id, item.subject)}
                          className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ml-0.5"
                          title="Delete Class"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 2. Card Middle: Subject and Code */}
                  <div>
                    <h4
                      className={`font-extrabold text-sm line-clamp-1 ${
                        isItemLive
                          ? "text-emerald-950 dark:text-emerald-100"
                          : "text-slate-900 dark:text-white"
                      }`}
                      title={item.subject}
                    >
                      {item.subject}
                    </h4>
                    {item.code && (
                      <span className="text-[10px] font-mono text-slate-400 font-medium">
                        {item.code}
                      </span>
                    )}
                  </div>

                  {/* 3. Card Bottom: Room and Professor */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/60 truncate">
                    {item.room ? (
                      <span className="flex items-center gap-1 truncate" title={item.room}>
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.room}</span>
                      </span>
                    ) : item.professor ? (
                      <span className="flex items-center gap-1 truncate" title={item.professor}>
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.professor}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">No room set</span>
                    )}
                    {item.room && item.professor && (
                      <span className="flex items-center gap-1 truncate text-slate-400" title={item.professor}>
                        • <User className="w-3 h-3 shrink-0" />
                        <span className="truncate">{item.professor}</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
        )}

        {/* Quick Add Class card at end of row for Admin */}
        {isAdmin && entries.length > 0 && (
          <button
            type="button"
            onClick={() => handleOpenAddModal(activeDay)}
            className="min-w-[120px] shrink-0 p-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all flex flex-col items-center justify-center gap-1 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        )}
      </div>

      {/* Add Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    Add Class Schedule
                  </h3>
                  <p className="text-xs text-slate-400">Set recurring lectures and labs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEntry} className="space-y-3">
              {/* Day of Week Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Day of Week
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setFormDay(d)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                        formDay === d
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Subject / Course Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems, Mathematics IV"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Course Code (Optional) */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Course Code <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CS401, MAT202"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Times Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Start Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM"
                    value={formStartTime}
                    onChange={(e) => setFormStartTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    End Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 10:00 AM"
                    value={formEndTime}
                    onChange={(e) => setFormEndTime(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-mono"
                  />
                </div>
              </div>

              {/* Room & Professor Row */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Room / Lab <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Room 302, Lab 4"
                    value={formRoom}
                    onChange={(e) => setFormRoom(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Professor <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. Sharma"
                    value={formProfessor}
                    onChange={(e) => setFormProfessor(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={
                  submitting ||
                  !formSubject.trim() ||
                  !formStartTime.trim() ||
                  !formEndTime.trim()
                }
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Class to {formDay}</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Schedule & Export Modal */}
      {isWeeklyModalOpen && (
        <WeeklyScheduleModal
          isOpen={isWeeklyModalOpen}
          onClose={() => setIsWeeklyModalOpen(false)}
        />
      )}
    </div>
  );
}
