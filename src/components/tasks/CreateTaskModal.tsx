"use client";

import { useState, useEffect } from "react";
import {
  FiX,
  FiCheckSquare,
  FiCalendar,
  FiUser,
  FiFolder,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { taskService, TaskStatus, TaskPriority } from "@/lib/services/taskService";
import {
  projectService,
  Project,
  UnifiedProjectMember,
  getUnifiedProjectMembers,
} from "@/lib/services/projectService";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialProjectId?: string;
  initialStatus?: TaskStatus;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  initialProjectId,
  initialStatus = "TODO",
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>(initialStatus);
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [projectId, setProjectId] = useState(initialProjectId || "");
  const [assigneeId, setAssigneeId] = useState("");

  const [projects, setProjects] = useState<Project[]>([]);
  const [projectMembers, setProjectMembers] = useState<UnifiedProjectMember[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Sync initial props
  useEffect(() => {
    if (isOpen) {
      if (initialProjectId) {
        setProjectId(initialProjectId);
      }
      setStatus(initialStatus || "TODO");
    }
  }, [isOpen, initialProjectId, initialStatus]);

  // Load user projects if modal is open
  useEffect(() => {
    if (!isOpen) return;

    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await projectService.getAllProjects({ limit: 100 });
        setProjects(res.data || []);
        // If no project selected yet and projects exist, default to first
        if (!projectId && res.data?.length > 0 && !initialProjectId) {
          setProjectId(res.data[0].id);
        }
      } catch (err: any) {
        toast.error("Failed to load projects: " + getApiErrorMessage(err));
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, [isOpen, initialProjectId]);

  // When selected projectId changes, fetch its members for assignment
  useEffect(() => {
    if (!isOpen || !projectId) {
      setProjectMembers([]);
      setAssigneeId("");
      return;
    }

    const fetchMembers = async () => {
      setLoadingMembers(true);
      try {
        const res = await projectService.getProjectById(projectId);
        if (res.data) {
          const unified = getUnifiedProjectMembers(res.data);
          setProjectMembers(unified);
        }
      } catch (err) {
        // Fallback: check in loaded projects
        const currentProj = projects.find((p) => p.id === projectId);
        if (currentProj) {
          setProjectMembers(getUnifiedProjectMembers(currentProj));
        }
      } finally {
        setLoadingMembers(false);
      }
    };

    fetchMembers();
  }, [isOpen, projectId, projects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!projectId) {
      toast.error("Please select a project for this task");
      return;
    }

    setSubmitting(true);
    try {
      let isoDueDate: string | null = null;
      if (dueDate) {
        // Form is YYYY-MM-DD, convert to end of day UTC or exact ISO
        isoDueDate = new Date(dueDate + "T23:59:59.000Z").toISOString();
      }

      const res = await taskService.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        projectId,
        status,
        priority,
        dueDate: isoDueDate,
        assigneeId: assigneeId || undefined,
      });

      toast.success(res.message || "Task created successfully!");
      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
      setAssigneeId("");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FiCheckSquare size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Create New Task
              </h2>
              <p className="text-xs text-slate-500">
                Track deliverables and assign work to teammates
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

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* PROJECT SELECTOR */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FiFolder className="text-indigo-600" size={14} />
              Project <span className="text-rose-500">*</span>
            </label>
            {loadingProjects ? (
              <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
            ) : (
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!!initialProjectId && projects.length > 0}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition disabled:opacity-75 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  Select a project...
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isOwner ? "(Owned)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* TASK TITLE */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={200}
              placeholder="e.g. Design user onboarding wireframes"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              rows={3}
              maxLength={2000}
              placeholder="Add details, acceptance criteria, or links..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition resize-none"
            />
          </div>

          {/* PRIORITY & STATUS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* PRIORITY */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FiAlertCircle size={14} className="text-amber-500" />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              >
                <option value="LOW">🟢 Low Priority</option>
                <option value="MEDIUM">🟡 Medium Priority</option>
                <option value="HIGH">🔴 High Priority</option>
              </select>
            </div>

            {/* STATUS */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* DUE DATE & ASSIGNEE GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* DUE DATE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FiCalendar className="text-slate-400" size={14} />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* ASSIGNEE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FiUser className="text-slate-400" size={14} />
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={loadingMembers}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition disabled:opacity-60"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => (
                  <option key={m.userId} value={m.userId}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* MODAL FOOTER */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim() || !projectId}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition cursor-pointer"
            >
              {submitting && <FiLoader className="animate-spin" size={14} />}
              <span>{submitting ? "Creating..." : "Create Task"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
