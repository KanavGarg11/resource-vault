"use client";

import { useState, useEffect } from "react";
import { AcademicEvent } from "@/lib/types";
import { CalendarDays, GraduationCap, PartyPopper, AlertCircle, ChevronRight } from "lucide-react";
import { formatDistanceToNow, isPast, format } from "date-fns";
import Link from "next/link";

export function UpcomingExamsWidget() {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "exam":
        return {
          icon: GraduationCap,
          bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60",
          tag: "Exam",
        };
      case "holiday":
        return {
          icon: PartyPopper,
          bg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/60",
          tag: "Holiday",
        };
      default:
        return {
          icon: AlertCircle,
          bg: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-900/60",
          tag: "Notice",
        };
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
              Exams & Academic Calendar
            </h3>
            <p className="text-[11px] text-slate-400">Date-bound college notices</p>
          </div>
        </div>

        <Link
          href="/timetable#calendar"
          className="text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 flex items-center gap-0.5"
        >
          <span>Calendar</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Events List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">Loading notices...</div>
        ) : events.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No upcoming academic events scheduled.
          </div>
        ) : (
          events.map((ev) => {
            const start = new Date(ev.startDate);
            const end = ev.endDate ? new Date(ev.endDate) : null;
            const hasStarted = isPast(start);
            const isOngoing = hasStarted && end && !isPast(end);
            const badge = getEventBadge(ev.eventType);
            const Icon = badge.icon;

            return (
              <div
                key={ev.id}
                className="p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-900 transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg}`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{badge.tag}</span>
                  </span>

                  {isOngoing ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 animate-pulse">
                      Active Now
                    </span>
                  ) : hasStarted ? (
                    <span className="text-[10px] text-slate-400">Concluded</span>
                  ) : (
                    <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                      Starts in {formatDistanceToNow(start)}
                    </span>
                  )}
                </div>

                <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white leading-snug">
                  {ev.title}
                </h4>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>
                    {format(start, "MMM d")}
                    {end && ` - ${format(end, "MMM d, yyyy")}`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
