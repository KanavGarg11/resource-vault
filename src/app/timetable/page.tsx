"use client";

import { useState, useEffect } from "react";
import { TimetableEntry, AcademicEvent } from "@/lib/types";
import { useAdmin } from "@/hooks/useAdmin";
import { BottomNav } from "@/components/layout/BottomNav";
import { OmniDropBar } from "@/components/dashboard/OmniDropBar";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  GraduationCap,
  PartyPopper,
  AlertCircle,
  Plus,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TimetablePage() {
  const { isAdmin, openPinModal } = useAdmin();
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("Monday");
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);

  // New Class Form State
  const [newDay, setNewDay] = useState("Monday");
  const [newSubject, setNewSubject] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newRoom, setNewRoom] = useState("");
  const [newProfessor, setNewProfessor] = useState("");
  const [classSubmitting, setClassSubmitting] = useState(false);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("exam");
  const [eventStart, setEventStart] = useState("");
  const [eventEnd, setEventEnd] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventSubmitting, setEventSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [tRes, eRes] = await Promise.all([
        fetch("/api/timetable"),
        fetch("/api/events"),
      ]);

      if (tRes.ok) {
        const tData = await tRes.json();
        setTimetable(tData.entries || []);
      }
      if (eRes.ok) {
        const eData = await eRes.json();
        setEvents(eData.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      openPinModal();
      return;
    }

    setClassSubmitting(true);
    try {
      const res = await fetch("/api/timetable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dayOfWeek: newDay,
          subject: newSubject,
          code: newCode,
          startTime: newStartTime,
          endTime: newEndTime,
          room: newRoom,
          professor: newProfessor,
        }),
      });

      if (res.ok) {
        await fetchData();
        setIsClassModalOpen(false);
        setNewSubject("");
        setNewCode("");
        setNewStartTime("");
        setNewEndTime("");
        setNewRoom("");
        setNewProfessor("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClassSubmitting(false);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!isAdmin || !confirm("Delete this timetable class slot?")) return;
    try {
      const res = await fetch(`/api/timetable/${id}`, { method: "DELETE" });
      if (res.ok) {
        setTimetable((prev) => prev.filter((item) => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      openPinModal();
      return;
    }

    setEventSubmitting(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          eventType,
          startDate: eventStart,
          endDate: eventEnd || null,
          description: eventDesc || null,
        }),
      });

      if (res.ok) {
        await fetchData();
        setIsEventModalOpen(false);
        setEventTitle("");
        setEventStart("");
        setEventEnd("");
        setEventDesc("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!isAdmin || !confirm("Delete this calendar event?")) return;
    try {
      const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const activeDayClasses = timetable.filter((item) => item.dayOfWeek === activeDay);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-violet-50 dark:bg-violet-950/60 border border-violet-200 dark:border-violet-900/60 flex items-center justify-center text-violet-600 dark:text-violet-400">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Timetable & Academic Calendar
            </h1>
            <p className="text-xs text-slate-400">
              Daily class schedules and semester exam / holiday timelines
            </p>
          </div>
        </div>

        {/* Admin Quick Action */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              if (!isAdmin) openPinModal();
              else setIsClassModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class Slot</span>
          </button>
          <button
            onClick={() => {
              if (!isAdmin) openPinModal();
              else setIsEventModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Calendar Event</span>
          </button>
        </div>
      </div>

      {/* Section 1: Weekly Class Timetable */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Weekly Class Schedule</span>
            </h2>
            <p className="text-xs text-slate-400">
              Checked almost everyday — tap any day to view its routine
            </p>
          </div>
        </div>

        {/* Day Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {DAYS.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                activeDay === day
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Classes List */}
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading schedule...</div>
        ) : activeDayClasses.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No classes scheduled for {activeDay}
            </h4>
            <p className="text-xs text-slate-400">Free time or self-study day!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeDayClasses.map((item) => (
              <div
                key={item.id}
                className="group relative p-4 rounded-2xl glass-panel border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      {item.subject}
                    </h3>
                    {item.code && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold inline-block mt-1">
                        {item.code}
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteClass(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete class"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-500">
                  <div className="space-y-1">
                    {item.room && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{item.room}</span>
                      </div>
                    )}
                    {item.professor && (
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>{item.professor}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-semibold text-xs text-indigo-600 dark:text-indigo-400 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/60 block">
                      {item.startTime} - {item.endTime}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 2: College Academic Calendar, Exams & Holidays */}
      <section id="calendar" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-500" />
            <span>Exams, Holidays & Semester Schedule</span>
          </h2>
          <p className="text-xs text-slate-400">
            Consulted less frequently — stays pinned until the target date passes
          </p>
        </div>

        {events.length === 0 ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-xs text-slate-400">
            No exam dates or college holidays added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((ev) => {
              const start = new Date(ev.startDate);
              const end = ev.endDate ? new Date(ev.endDate) : null;
              const hasStarted = isPast(start);
              const isOngoing = hasStarted && end && !isPast(end);
              const isConcluded = hasStarted && (!end || isPast(end));

              return (
                <div
                  key={ev.id}
                  className={`group relative p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isConcluded
                      ? "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60"
                      : isOngoing
                      ? "bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        ev.eventType === "exam"
                          ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                          : ev.eventType === "holiday"
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300"
                      }`}
                    >
                      {ev.eventType}
                    </span>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                    {ev.title}
                  </h4>

                  {ev.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {ev.description}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {format(start, "MMM d")}
                      {end && ` - ${format(end, "MMM d, yyyy")}`}
                    </span>

                    {isOngoing ? (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
                        Active Now
                      </span>
                    ) : isConcluded ? (
                      <span className="text-[10px] text-slate-400">Passed</span>
                    ) : (
                      <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                        In {formatDistanceToNow(start)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Modal: Add Class Slot */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Class Schedule Slot
              </h3>
              <button
                onClick={() => setIsClassModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Day</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Course Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    placeholder="e.g. CS301"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Room / Lab
                  </label>
                  <input
                    type="text"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="e.g. Room 302 / Lab 4"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    placeholder="e.g. 09:00 AM"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    placeholder="e.g. 10:00 AM"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Professor / Instructor
                </label>
                <input
                  type="text"
                  value={newProfessor}
                  onChange={(e) => setNewProfessor(e.target.value)}
                  placeholder="e.g. Dr. Rao"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={classSubmitting}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {classSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Class Slot"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Calendar Event */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Exam / Calendar Notice
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Event Type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="exam">Exam Schedule</option>
                  <option value="holiday">College Holiday / Break</option>
                  <option value="deadline">Academic Deadline / Submission</option>
                  <option value="calendar">General Calendar Notice</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Mid-Term Theory Examinations"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={eventEnd}
                    onChange={(e) => setEventEnd(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  placeholder="e.g. Units 1 to 3 included. Hall tickets required."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={eventSubmitting}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center gap-1.5"
              >
                {eventSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Notice"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Quick Drop Trigger */}
      {isDropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <OmniDropBar
              isModal
              onClose={() => setIsDropModalOpen(false)}
              onResourceCreated={() => {
                fetchData();
                setIsDropModalOpen(false);
              }}
            />
          </div>
        </div>
      )}

      <BottomNav onQuickDropOpen={() => setIsDropModalOpen(true)} />
    </div>
  );
}
