"use client";

import { useState } from "react";
import { FiAlertTriangle, FiX, FiLoader } from "react-icons/fi";
import { taskService, Task } from "@/lib/services/taskService";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface DeleteTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  task: Task | null;
}

export function DeleteTaskModal({
  isOpen,
  onClose,
  onSuccess,
  task,
}: DeleteTaskModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !task) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await taskService.deleteTask(task.id);
      toast.success(res.message || "Task deleted successfully!");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FiAlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Delete Task
              </h2>
              <p className="text-xs text-slate-500">
                This action cannot be undone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <strong className="text-slate-900">"{task.title}"</strong>? Only the
            project owner has permission to delete tasks.
          </p>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-xs text-amber-800">
            <FiAlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={14} />
            <span>
              Deleting this task will permanently remove it from the project board and history.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-100 transition cursor-pointer"
            >
              {loading && <FiLoader className="animate-spin" size={14} />}
              <span>{loading ? "Deleting..." : "Delete Task"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
