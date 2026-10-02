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
  Loader2,
  Sparkles,
  Check,
  ArrowRight,
} from "lucide-react";

interface WeeklyScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BASE_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Vibrant color palette for subject border-left and accents
const SUBJECT_COLORS = [
  "border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300",
  "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300",
  "border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300",
  "border-purple-500 bg-purple-50/70 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300",
  "border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300",
  "border-cyan-500 bg-cyan-50/70 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300",
  "border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300",
  "border-teal-500 bg-teal-50/70 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300",
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

  // Determine active days list (include Sunday if user has Sunday classes)
  const allDays = entries.some((e) => e.dayOfWeek === "Sunday")
    ? [...BASE_DAYS, "Sunday"]
    : BASE_DAYS;

  // Group entries by Day
  const entriesByDay: Record<string, TimetableEntry[]> = {};
  allDays.forEach((day) => {
    entriesByDay[day] = [];
  });

  entries.forEach((item) => {
    if (entriesByDay[item.dayOfWeek]) {
      entriesByDay[item.dayOfWeek].push(item);
    }
  });

  // Sort entries within each day by start time
  allDays.forEach((day) => {
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
      const node = exportRef.current;
      const isDark = document.documentElement.classList.contains("dark");

      // Small pause to allow layout rendering to settle
      await new Promise((resolve) => setTimeout(resolve, 80));

      // Capture full width & height unclipped at 2x resolution
      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: isDark ? "#0f172a" : "#ffffff",
        width: node.scrollWidth,
        height: node.scrollHeight,
        style: {
          transform: "none",
          margin: "0",
        },
      });

      const dateStr = new Date().toISOString().split("T")[0];
      const link = document.createElement("a");
      link.download = `LifeVault_Weekly_Timetable_${dateStr}.png`;
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
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-150 print:p-0 print:static print:bg-transparent print:backdrop-blur-none">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-6xl w-full h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 print:h-auto print:max-w-none print:w-full print:shadow-none print:border-none print:rounded-none">
        
        {/* Header Controls (3 buttons: Export PNG, Print/PDF, Close X pinned to the right) */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60 shadow-xs shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-sm sm:text-lg text-slate-900 dark:text-white truncate">
                Weekly Timetable
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate hidden xs:block">
                {totalClasses} class{totalClasses === 1 ? "" : "es"} • Export or print
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* 1. Export PNG Button */}
            <button
              onClick={handleExportPng}
              disabled={exporting || loading || totalClasses === 0}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
              title="Download structured schedule as high-resolution PNG image"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span className="hidden sm:inline">Generating...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Export PNG</span>
                  <span className="xs:hidden">PNG</span>
                </>
              )}
            </button>

            {/* 2. Print icon button */}
            <button
              onClick={handlePrint}
              disabled={loading || totalClasses === 0}
              className="inline-flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50"
              title="Print schedule or save as PDF"
              aria-label="Print schedule"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline ml-1.5">Print / PDF</span>
            </button>

            {/* 3. Cross icon for closing - pinned to the far right */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5 sm:ml-1"
              title="Close Modal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Horizontal Scroll Hint */}
        <div className="md:hidden px-4 py-1.5 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100/60 dark:border-indigo-900/40 flex items-center justify-between text-[11px] text-indigo-700 dark:text-indigo-300 shrink-0 print:hidden">
          <span className="flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-indigo-500" />
            Swipe sideways to view full day schedule
          </span>
          <span className="text-[10px] text-indigo-500/80 font-semibold uppercase">Full Grid ➔</span>
        </div>

        {/* Scrollable Printable/Exportable Canvas Container */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-3 sm:p-6 bg-slate-100/60 dark:bg-slate-950/60 print:overflow-visible print:p-0 print:bg-white">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3 min-h-[300px]">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-xs font-semibold">Loading weekly timetable...</p>
            </div>
          ) : totalClasses === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 min-h-[300px]">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 mb-3">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No classes in your timetable yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Add your lecture times and classrooms on the home dashboard using &ldquo;+ Add Class&rdquo; to generate your weekly schedule.
              </p>
            </div>
          ) : (
            <div className="w-max min-w-full flex justify-start md:justify-center">
              {/* THE EXPORT CANVAS (Unified horizontal structure across phone, laptop, and PNG export) */}
              <div
                ref={exportRef}
                className="w-max min-w-[820px] md:min-w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl transition-all print:border-none print:shadow-none print:p-2"
              >
                {/* Schedule Header Brand Banner */}
                <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-200/80 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        LifeVault Schedule
                      </h2>
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Weekly Academic Timetable
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {totalClasses} {totalClasses === 1 ? "Class" : "Classes"} Scheduled
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date().toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Table Rows (Strict horizontal flow: Monday classes ->, Tuesday classes ->, etc.) */}
                <div className="space-y-3">
                  {allDays.map((day) => {
                    const dayClasses = entriesByDay[day] || [];
                    return (
                      <div
                        key={day}
                        className="flex flex-row items-stretch gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 shadow-xs print:bg-slate-50 print:border-slate-300 print:break-inside-avoid"
                      >
                        {/* Day Column (Left) with right indicator -> */}
                        <div className="w-28 sm:w-36 shrink-0 flex flex-col justify-center pr-3 sm:pr-4 border-r-2 border-slate-200/80 dark:border-slate-700/60 print:border-slate-300">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white print:text-black">
                              {day}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-500/70 dark:text-indigo-400/70 shrink-0" />
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 print:text-slate-600 mt-0.5">
                            {dayClasses.length} {dayClasses.length === 1 ? "class" : "classes"}
                          </span>
                        </div>

                        {/* Classes Flow: Strictly Left to Right -> */}
                        <div className="flex-1 flex flex-row items-stretch gap-2.5 sm:gap-3 overflow-visible">
                          {dayClasses.length === 0 ? (
                            <div className="h-full min-h-[76px] w-full flex items-center px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700/80 print:border-slate-300 text-xs text-slate-400 italic">
                              No classes scheduled • Free day
                            </div>
                          ) : (
                            dayClasses.map((item) => {
                              const colorClass = getSubjectColorClass(item.subject);
                              return (
                                <div
                                  key={item.id}
                                  className={`w-[190px] sm:w-[215px] shrink-0 p-3 sm:p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 border-l-4 ${colorClass} bg-white dark:bg-slate-800/90 shadow-2xs flex flex-col justify-between print:border-slate-300 print:bg-white`}
                                >
                                  <div>
                                    <div className="flex items-start justify-between gap-1.5">
                                      <p className="text-xs sm:text-[13px] font-extrabold text-slate-900 dark:text-white print:text-black leading-tight line-clamp-1">
                                        {item.subject}
                                      </p>
                                      {item.code && (
                                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300 uppercase shrink-0 font-semibold print:bg-slate-100 print:text-slate-800">
                                          {item.code}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 print:text-slate-600 mt-1.5">
                                      <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span>
                                        {item.startTime} – {item.endTime}
                                      </span>
                                    </div>
                                  </div>

                                  {(item.room || item.professor) && (
                                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/50 print:border-slate-200 flex-wrap">
                                      {item.room && (
                                        <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 print:text-slate-700">
                                          <MapPin className="w-2.5 h-2.5 text-indigo-500" />
                                          <span>{item.room}</span>
                                        </span>
                                      )}
                                      {item.professor && (
                                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 print:text-slate-600">
                                          <User className="w-2.5 h-2.5 text-slate-400" />
                                          <span className="truncate max-w-[95px]">{item.professor}</span>
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Brand watermark */}
                <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    LifeVault • Personal Resource Manager
                  </span>
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
