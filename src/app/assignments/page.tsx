"use client";

import { useState, useEffect } from "react";
import { Resource } from "@/lib/types";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { FilePreviewModal } from "@/components/resources/FilePreviewModal";
import { OmniDropBar } from "@/components/dashboard/OmniDropBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAdmin } from "@/hooks/useAdmin";
import {
  CheckSquare,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { isPast } from "date-fns";

export default function AssignmentsPage() {
  const { isAdmin, openPinModal } = useAdmin();
  const [assignments, setAssignments] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "in-progress" | "completed">("pending");
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await fetch("/api/resources?type=assignment");
      if (res.ok) {
        const data = await res.json();
        setAssignments(data.resources || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleToggleStatus = async (
    id: string,
    newStatus: "pending" | "in-progress" | "completed"
  ) => {
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setAssignments((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    setAssignments((prev) => prev.filter((r) => r.id !== id));
  };

  // Group by status
  const pendingItems = assignments.filter((a) => a.status === "pending" || !a.status);
  const inProgressItems = assignments.filter((a) => a.status === "in-progress");
  const completedItems = assignments.filter((a) => a.status === "completed");

  const overdueCount = assignments.filter(
    (a) => a.status !== "completed" && a.dueDate && isPast(new Date(a.dueDate))
  ).length;

  const currentList =
    activeTab === "pending"
      ? pendingItems
      : activeTab === "in-progress"
      ? inProgressItems
      : completedItems;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                  Assignments & Deadlines
                </h1>
                {overdueCount > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{overdueCount} Overdue</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Visual deadline reminders that never get buried or forgotten
              </p>
            </div>
          </div>
        </div>

        {/* Add Assignment Trigger */}
        <button
          onClick={() => {
            if (!isAdmin) openPinModal();
            else setIsDropModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment / Task</span>
        </button>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-panel">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "pending"
              ? "bg-amber-500 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>To Do ({pendingItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("in-progress")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "in-progress"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>In Progress ({inProgressItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("completed")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold transition-all ${
            activeTab === "completed"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Completed ({completedItems.length})</span>
        </button>
      </div>

      {/* Assignment Cards List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-slate-400">Loading assignments...</div>
      ) : currentList.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-2">
          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500" />
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {activeTab === "pending"
              ? "No pending assignments! All caught up!"
              : activeTab === "in-progress"
              ? "No tasks currently in progress"
              : "No completed assignments recorded yet"}
          </h4>
          <p className="text-xs text-slate-400">
            {activeTab === "pending"
              ? "Drop new assignments or lab tasks above whenever you get them."
              : ""}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentList.map((item) => (
            <ResourceCard
              key={item.id}
              resource={item}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
              onPreview={setPreviewResource}
            />
          ))}
        </div>
      )}

      {/* File Preview Modal */}
      <FilePreviewModal
        resource={previewResource}
        onClose={() => setPreviewResource(null)}
      />

      {/* Modal Drop */}
      {isDropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg">
            <OmniDropBar
              isModal
              onClose={() => setIsDropModalOpen(false)}
              onResourceCreated={() => {
                fetchAssignments();
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
