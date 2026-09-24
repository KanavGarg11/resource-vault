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
} from "lucide-react";
import Link from "next/link";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function TodayScheduleWidget() {
  const { isAdmin, openPinModal } = useAdmin();

  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current day name (default to Monday if weekend)
  const currentDayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const todayName =
    currentDayIndex >= 1 && currentDayIndex <= 6
      ? DAYS[currentDayIndex - 1]
      : "Monday";

  const [activeDay, setActiveDay] = useState(todayName);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

        <div className="flex items-center gap-2">
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

      {/* Schedule Items List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
            <span>Loading classes...</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3 p-4">
            <Calendar className="w-6 h-6 mx-auto text-slate-400" />
            <p className="text-xs text-slate-500">
              No scheduled classes for <strong>{activeDay}</strong>.
            </p>
            {isAdmin ? (
              <button
                type="button"
                onClick={() => handleOpenAddModal(activeDay)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Add Class for {activeDay}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openPinModal}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Enter Admin PIN (1106) to set classes
              </button>
            )}
          </div>
        ) : (
          entries.map((item) => (
            <div
              key={item.id}
              className="group flex items-start justify-between p-3 rounded-2xl bg-white dark:bg-slate-850 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-200 dark:hover:border-indigo-900 transition-colors"
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

              {/* Time Badge and Delete Action */}
              <div className="flex items-center gap-2">
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 block">
                    {item.startTime}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    to {item.endTime}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleDeleteEntry(item.id, item.subject)}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors opacity-70 group-hover:opacity-100"
                    title="Delete Class"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
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
    </div>
  );
}
