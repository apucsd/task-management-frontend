"use client";

import { useState } from "react";
import {
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiFolder,
  FiMoreVertical,
  FiArrowRight,
} from "react-icons/fi";
import {
  Task,
  TaskStatus,
  TaskPriority,
  taskService,
} from "@/lib/services/taskService";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskCard({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Priority config
  const priorityConfig: Record<
    TaskPriority,
    { label: string; bg: string; text: string; dot: string }
  > = {
    HIGH: {
      label: "High",
      bg: "bg-rose-50 border-rose-200/80",
      text: "text-rose-700",
      dot: "bg-rose-500",
    },
    MEDIUM: {
      label: "Medium",
      bg: "bg-amber-50 border-amber-200/80",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    LOW: {
      label: "Low",
      bg: "bg-emerald-50 border-emerald-200/80",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
  };

  const currentPriority =
    priorityConfig[task.priority] || priorityConfig.MEDIUM;

  // Due date formatting & overdue calculation
  const isOverdue =
    task.dueDate &&
    task.status !== "DONE" &&
    new Date(task.dueDate).getTime() < Date.now();

  const formattedDueDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  // Quick toggle status
  const handleToggleDone = async () => {
    const nextStatus: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    setUpdatingStatus(true);
    try {
      await taskService.updateTaskStatus(task.id, nextStatus);
      toast.success(
        nextStatus === "DONE"
          ? "Task marked as completed! 🎉"
          : "Task marked as to-do",
      );
      onStatusChange?.(task.id, nextStatus);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleStatusSelect = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    setUpdatingStatus(true);
    try {
      await taskService.updateTaskStatus(task.id, newStatus);
      toast.success(
        `Task moved to ${newStatus.replace("_", " ").toLowerCase()}`,
      );
      onStatusChange?.(task.id, newStatus);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div
      className={`group relative bg-white rounded-2xl p-4.5 border transition-all duration-200 hover:shadow-md ${
        task.status === "DONE"
          ? "border-slate-100/80 bg-slate-50/40 opacity-80"
          : "border-slate-100 hover:border-slate-200 shadow-xs"
      }`}
    >
      {/* CARD TOP ROW: PROJECT + PRIORITY + MENU */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          {/* PRIORITY PILL */}
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${currentPriority.bg} ${currentPriority.text}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`}
            />
            {currentPriority.label}
          </span>

          {/* PROJECT BADGE */}
          {task.project && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 max-w-[140px] truncate">
              <FiFolder size={11} className="text-slate-400 shrink-0" />
              <span className="truncate">{task.project.name}</span>
            </span>
          )}
        </div>

        {/* ACTIONS MENU */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Options"
          >
            <FiMoreVertical size={15} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30 text-xs">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <FiEdit2 size={13} />
                  Edit Task
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <FiTrash2 size={13} />
                  Delete Task
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CARD BODY: TITLE & DESCRIPTION */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-start gap-2.5">
          <button
            onClick={handleToggleDone}
            disabled={updatingStatus}
            className={`mt-0.5 shrink-0 transition cursor-pointer ${
              task.status === "DONE"
                ? "text-emerald-500 hover:text-emerald-600"
                : "text-slate-300 hover:text-indigo-600"
            }`}
            title={task.status === "DONE" ? "Mark incomplete" : "Mark done"}
          >
            {task.status === "DONE" ? (
              <FiCheckCircle size={17} className="fill-emerald-50" />
            ) : (
              <FiCircle size={17} />
            )}
          </button>

          <h3
            className={`text-sm font-semibold text-slate-900 leading-snug flex-1 ${
              task.status === "DONE" ? "line-through text-slate-400" : ""
            }`}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 pl-6 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* CARD FOOTER: DUE DATE, ASSIGNEE, QUICK STATUS */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        {/* DUE DATE */}
        {formattedDueDate ? (
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[11px] ${
              isOverdue
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "text-slate-500 bg-slate-50"
            }`}
            title={isOverdue ? "Overdue task!" : "Due date"}
          >
            <FiCalendar
              size={12}
              className={isOverdue ? "text-rose-600" : "text-slate-400"}
            />
            <span>{formattedDueDate}</span>
            {isOverdue && (
              <span className="font-bold text-[10px]">Overdue</span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <FiClock size={11} /> No due date
          </div>
        )}

        {/* RIGHT SIDE: ASSIGNEE + QUICK STATUS SELECT */}
        <div className="flex items-center gap-2">
          {/* QUICK STATUS SELECT */}
          <select
            value={task.status}
            onChange={(e) => handleStatusSelect(e.target.value as TaskStatus)}
            disabled={updatingStatus}
            className="text-[11px] font-semibold px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 focus:outline-none transition cursor-pointer"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>

          {/* ASSIGNEE AVATAR */}
          {task.assignee ? (
            <div
              className="relative group/user shrink-0"
              title={`Assigned to ${task.assignee.name}`}
            >
              {task.assignee.image ? (
                <img
                  src={task.assignee.image}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full object-cover border border-indigo-200 ring-1 ring-white"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px] ring-1 ring-white">
                  {task.assignee.name.slice(0, 2).toUpperCase() || "U"}
                </div>
              )}
            </div>
          ) : (
            <span
              className="w-6 h-6 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[10px]"
              title="Unassigned"
            >
              ?
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
