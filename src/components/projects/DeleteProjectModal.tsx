"use client";

import { useState } from "react";
import { FiAlertTriangle, FiLoader, FiX } from "react-icons/fi";
import { projectService, Project } from "@/lib/services/projectService";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface DeleteProjectModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DeleteProjectModal({
  isOpen,
  project,
  onClose,
  onSuccess,
}: DeleteProjectModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !project) return null;

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await projectService.deleteProject(project.id);
      toast.success(res.message || "Project deleted successfully");
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
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <FiAlertTriangle size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Delete Project
              </h2>
              <p className="text-xs text-slate-500">
                This action is irreversible
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-slate-900">
              "{project.name}"
            </span>
            ? All tasks, milestones, and member assignments associated with this
            project will be permanently deleted.
          </p>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
            >
              {loading && <FiLoader className="animate-spin" size={14} />}
              {loading ? "Deleting..." : "Delete Project"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
