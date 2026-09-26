"use client";

import React, { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";
import { TimetableEntry } from "@/lib/types";
import {
  X,
  Download,
  Printer,
  Calendar,
  Clock,
  MapPin,
  User,
  Smartphone,
  LayoutGrid,
  Loader2,
  Sparkles,
  Check,
} from "lucide-react";

interface WeeklyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Consistent soft palette for subject badges
const SUBJECT_COLORS = [
  "border-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300",
  "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300",
  "border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300",
  "border-purple-400 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300",
  "border-rose-400 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300",
  "border-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300",
];

function getSubjectColorClass(subject: string): string {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % SUBJECT_COLORS.length;
  return SUBJECT_COLORS[index];
}

export function WeeklyScheduleModal({ isOpen, onClose }: WeeklyScheduleModalProps) {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "wallpaper">("grid");
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllEntries();
    }
  }, [isOpen]);

  const fetchAllEntries = async () => {
    setLoading(true);
    try {
      // Calling /api/timetable with no day parameter returns all classes for the user
      const res = await fetch("/api/timetable");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (err) {
      console.error("Error fetching full timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Group entries by Day
  const entriesByDay: Record<string, TimetableEntry[]> = {};
  DAYS.forEach((day) => {
    entriesByDay[day] = [];
  });

  entries.forEach((item) => {
    if (entriesByDay[item.dayOfWeek]) {
      entriesByDay[item.dayOfWeek].push(item);
    }
  });

  // Sort entries within each day by start time
  DAYS.forEach((day) => {
    entriesByDay[day].sort((a, b) => {
      const getMinutes = (t: string) => {
        const match = t.trim().match(/^(\d{1,2}):(\d{2})(?:\s*([aApP][mM]))?$/);
        if (!match) return 0;
        let h = parseInt(match[1], 10);
        const m = parseInt(match[2], 10);
        const meridian = match[3]?.toUpperCase();
        if (meridian === "PM" && h < 12) h += 12;
        if (meridian === "AM" && h === 12) h = 0;
        return h * 60 + m;
      };
      return getMinutes(a.startTime) - getMinutes(b.startTime);
    });
  });

  const totalClasses = entries.length;

  const handleExportPng = async () => {
    if (!exportRef.current) return;
    setExporting(true);
    try {
      // Export with 2x scale for crisp retina display
      const dataUrl = await toPng(exportRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });

      const link = document.createElement("a");
      link.download = `LifeVault_Weekly_Schedule_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error("Error generating schedule image:", err);
      alert("Could not generate image. You can also use Print / Save as PDF.");
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Controls */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60 shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Weekly Timetable & Export
              </h3>
              <p className="text-xs text-slate-400">
                {totalClasses} class{totalClasses === 1 ? "" : "es"} across Mon–Sat • Ready to print or set as wallpaper
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Weekly Grid</span>
              </button>

              <button
                onClick={() => setViewMode("wallpaper")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === "wallpaper"
                    ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Wallpaper / Mobile</span>
              </button>
            </div>

            {/* Export Actions */}
            <button
              onClick={handleExportPng}
              disabled={exporting || loading || totalClasses === 0}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
              title="Download schedule as high-resolution PNG image"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating PNG...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PNG</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={loading || totalClasses === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Print schedule or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable/Exportable Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-xs font-semibold">Loading weekly timetable...</p>
            </div>
          ) : totalClasses === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No classes in your timetable yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Add your lecture times and classrooms on the home dashboard using "+ Add Class" to generate your weekly schedule.
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              {/* THE EXPORT CANVAS */}
              <div
                ref={exportRef}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl transition-all ${
                  viewMode === "wallpaper"
                    ? "max-w-md w-full"
                    : "w-full max-w-4xl"
                }`}
              >
                {/* Schedule Banner Brand */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                        LifeVault Schedule
                      </h2>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Weekly Academic Timetable
                      </p>
                    </div>
                  </div>

                  <span className="text-[11px] font-medium text-slate-400">
                    Updated {new Date().toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                  </span>
                </div>

                {/* View Mode 1: Table Grid */}
                {viewMode === "grid" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DAYS.map((day) => {
                      const dayClasses = entriesByDay[day];
                      return (
                        <div
                          key={day}
                          className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700/60 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                                {day}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"}
                              </span>
                            </div>

                            {dayClasses.length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-4 text-center">
                                No classes scheduled
                              </p>
                            ) : (
                              <div className="space-y-2.5">
                                {dayClasses.map((item) => {
                                  const colorClass = getSubjectColorClass(item.subject);
                                  return (
                                    <div
                                      key={item.id}
                                      className={`p-2.5 rounded-xl border-l-4 ${colorClass} bg-white dark:bg-slate-800 shadow-2xs`}
                                    >
                                      <div className="flex items-start justify-between gap-1">
                                        <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                          {item.subject}
                                        </p>
                                        {item.code && (
                                          <span className="text-[9px] font-mono opacity-80 uppercase">
                                            {item.code}
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                        <span>
                                          {item.startTime} – {item.endTime}
                                        </span>
                                      </div>

                                      {(item.room || item.professor) && (
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 flex-wrap">
                                          {item.room && (
                                            <span className="flex items-center gap-0.5">
                                              <MapPin className="w-2.5 h-2.5" />
                                              <span>{item.room}</span>
                                            </span>
                                          )}
                                          {item.professor && (
                                            <span className="flex items-center gap-0.5">
                                              <User className="w-2.5 h-2.5" />
                                              <span>{item.professor}</span>
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* View Mode 2: Phone Wallpaper Layout */}
                {viewMode === "wallpaper" && (
                  <div className="space-y-4">
                    {DAYS.map((day) => {
                      const dayClasses = entriesByDay[day];
                      if (dayClasses.length === 0) return null;

                      return (
                        <div key={day} className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
                            <span>{day}</span>
                            <span>{dayClasses.length} classes</span>
                          </div>

                          <div className="space-y-1.5">
                            {dayClasses.map((item) => {
                              const colorClass = getSubjectColorClass(item.subject);
                              return (
                                <div
                                  key={item.id}
                                  className={`p-2.5 rounded-xl border-l-4 ${colorClass} bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between gap-3`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                        {item.subject}
                                      </p>
                                      {item.code && (
                                        <span className="text-[9px] font-mono text-slate-400">
                                          ({item.code})
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                                      {item.room && <span>{item.room}</span>}
                                      {item.professor && <span>• {item.professor}</span>}
                                    </div>
                                  </div>

                                  <div className="text-right shrink-0">
                                    <span className="text-[11px] font-extrabold font-mono text-slate-800 dark:text-slate-200">
                                      {item.startTime}
                                    </span>
                                    <span className="text-[9px] text-slate-400 block font-mono">
                                      to {item.endTime}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer Brand watermark */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>LifeVault • Personal Resource Manager</span>
                  <span>Organized for Success</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
