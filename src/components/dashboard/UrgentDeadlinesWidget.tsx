"use client";

import { Resource } from "@/lib/types";
import { useAdmin } from "@/hooks/useAdmin";
import { CheckSquare, Clock, AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow, isPast } from "date-fns";
import Link from "next/link";

interface UrgentDeadlinesWidgetProps {
  assignments: Resource[];
  onToggleStatus: (id: string, newStatus: "pending" | "in-progress" | "completed") => void;
  onPreview: (resource: Resource) => void;
}

export function UrgentDeadlinesWidget({
  assignments,
  onToggleStatus,
  onPreview,
}: UrgentDeadlinesWidgetProps) {
  const { isAdmin } = useAdmin();

  const pendingAssignments = assignments.filter((a) => a.status !== "completed");

  return (
    <div className="glass-panel rounded-3xl p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Upcoming Deadlines
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300">
                {pendingAssignments.length}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Eye-catching task reminders</p>
          </div>
        </div>

        <Link
          href="/assignments"
          className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Task List */}
      <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
        {pendingAssignments.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-xs text-slate-500">All assignments completed! Great job!</p>
          </div>
        ) : (
          pendingAssignments.map((task) => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const overdue = dueDate ? isPast(dueDate) : false;
            const hoursLeft = dueDate ? (dueDate.getTime() - Date.now()) / (1000 * 60 * 60) : 999;
            const isNear = hoursLeft > 0 && hoursLeft <= 48;

            return (
              <div
                key={task.id}
                onClick={() => onPreview(task)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  overdue
                    ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:border-rose-400"
                    : isNear
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60 hover:border-amber-400"
                    : "bg-white dark:bg-slate-850 border-slate-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900"
                }`}
              >
                {/* Admin Status Toggle Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAdmin) {
                      onToggleStatus(task.id, "completed");
                    }
                  }}
                  disabled={!isAdmin}
                  className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                    isAdmin
                      ? "border-slate-300 dark:border-slate-600 hover:border-emerald-500 hover:bg-emerald-50 text-emerald-600 cursor-pointer"
                      : "border-slate-200 dark:border-slate-700 cursor-default opacity-50"
                  }`}
                  title={isAdmin ? "Mark as completed" : "Admin required to complete"}
                >
                  <span className="sr-only">Toggle complete</span>
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {task.category && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {task.category}
                      </span>
                    )}

                    {task.priority === "urgent" && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-rose-500 text-white">
                        🔥 Urgent
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white mt-1 truncate">
                    {task.title}
                  </h4>

                  {/* Countdown Badge */}
                  {dueDate && (
                    <div className="flex items-center gap-1 text-[11px] mt-1 font-medium">
                      {overdue ? (
                        <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Overdue ({formatDistanceToNow(dueDate)} ago)</span>
                        </div>
                      ) : (
                        <div
                          className={`flex items-center gap-1 ${
                            isNear
                              ? "text-amber-600 dark:text-amber-400 font-semibold"
                              : "text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>Due {formatDistanceToNow(dueDate, { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
