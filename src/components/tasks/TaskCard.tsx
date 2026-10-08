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
  FiArrowLeft,
  FiCheck,
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
  const [isDragging, setIsDragging] = useState(false);

  // Priority visual tokens
  const priorityConfig: Record<
    TaskPriority,
    { label: string; badge: string; dot: string; leftBorder: string }
  > = {
    HIGH: {
      label: "High",
      badge: "bg-rose-50 text-rose-700 border-rose-200/80",
      dot: "bg-rose-500",
      leftBorder: "border-l-rose-500",
    },
    MEDIUM: {
      label: "Medium",
      badge: "bg-amber-50 text-amber-700 border-amber-200/80",
      dot: "bg-amber-500",
      leftBorder: "border-l-amber-500",
    },
    LOW: {
      label: "Low",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
      dot: "bg-emerald-500",
      leftBorder: "border-l-emerald-500",
    },
  };

  const currentPriority = priorityConfig[task.priority] || priorityConfig.MEDIUM;

  // Due date calculations
  const dueDateObj = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue =
    dueDateObj &&
    task.status !== "DONE" &&
    dueDateObj.getTime() < Date.now();

  const getDueLabel = () => {
    if (!dueDateObj) return null;
    return dueDateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const dueLabel = getDueLabel();

  // Quick toggle status
  const handleToggleDone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    if (onStatusChange) {
      onStatusChange(task.id, nextStatus);
      return;
    }
    setUpdatingStatus(true);
    try {
      await taskService.updateTaskStatus(task.id, nextStatus);
      toast.success(
        nextStatus === "DONE"
          ? "Task marked as completed! 🎉"
          : "Task moved to To Do"
      );
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Move task to specific status
  const handleMoveTo = async (newStatus: TaskStatus, e: React.MouseEvent) => {
    e.stopPropagation();
    if (newStatus === task.status) return;
    if (onStatusChange) {
      onStatusChange(task.id, newStatus);
      return;
    }
    setUpdatingStatus(true);
    try {
      await taskService.updateTaskStatus(task.id, newStatus);
      const label =
        newStatus === "DONE"
          ? "Completed"
          : newStatus === "IN_PROGRESS"
          ? "In Progress"
          : "To Do";
      toast.success(`Task moved to ${label}`);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-white rounded-2xl p-4 border border-l-4 transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-md ${
        currentPriority.leftBorder
      } ${
        isDragging
          ? "opacity-30 scale-95 ring-2 ring-indigo-400"
          : "border-slate-100/90 shadow-2xs hover:border-slate-200/90"
      } ${
        task.status === "DONE"
          ? "bg-slate-50/50 opacity-80"
          : ""
      }`}
    >
      {/* CARD TOP ROW: PROJECT + PRIORITY + OPTIONS MENU */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* PRIORITY BADGE */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${currentPriority.badge}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${currentPriority.dot}`}
            />
            {currentPriority.label}
          </span>

          {/* PROJECT TAG */}
          {task.project && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100/90 text-slate-600 max-w-[130px] truncate">
              <FiFolder size={11} className="text-slate-400 shrink-0" />
              <span className="truncate">{task.project.name}</span>
            </span>
          )}
        </div>

        {/* OPTIONS MENU */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen)}
            }
            className="p-1 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Task options"
          >
            <FiMoreVertical size={14} />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-30 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  <FiEdit2 size={12} />
                  Edit Task
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(task);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                >
                  <FiTrash2 size={12} />
                  Delete Task
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* CARD BODY: TITLE & DESCRIPTION */}
      <div className="space-y-1 mb-3">
        <div className="flex items-start gap-2">
          {/* QUICK COMPLETE CHECK BUTTON */}
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
              <FiCheckCircle size={16} className="fill-emerald-50" />
            ) : (
              <FiCircle size={16} />
            )}
          </button>

          <h3
            className={`text-xs sm:text-sm font-semibold text-slate-900 leading-snug flex-1 ${
              task.status === "DONE" ? "line-through text-slate-400" : ""
            }`}
          >
            {task.title}
          </h3>
        </div>

        {task.description && (
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-2 pl-6 leading-relaxed">
            {task.description}
          </p>
        )}
      </div>

      {/* CARD FOOTER: DUE DATE + ASSIGNEE + QUICK NUDGE BUTTONS */}
      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
        {/* DUE DATE */}
        {dueLabel ? (
          <div
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium text-[10px] sm:text-[11px] ${
              isOverdue
                ? "bg-rose-50 text-rose-700 border border-rose-200"
                : "text-slate-500 bg-slate-50"
            }`}
            title={task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}
          >
            <FiCalendar
              size={11}
              className={isOverdue ? "text-rose-600" : "text-slate-400"}
            />
            <span>{dueLabel}</span>
            {isOverdue && (
              <span className="text-[9px] font-bold text-rose-700 bg-rose-100/90 px-1 py-0.2 rounded">
                Overdue
              </span>
            )}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <FiClock size={11} /> No date
          </div>
        )}

        {/* RIGHT SIDE: QUICK STAGE NUDGERS + ASSIGNEE */}
        <div className="flex items-center gap-2">
          {/* QUICK STAGE NUDGE BUTTONS */}
          <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
            {task.status === "TODO" && (
              <button
                onClick={(e) => handleMoveTo("IN_PROGRESS", e)}
                disabled={updatingStatus}
                className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="Start working on this task"
              >
                <span>Start</span>
                <FiArrowRight size={10} />
              </button>
            )}

            {task.status === "IN_PROGRESS" && (
              <>
                <button
                  onClick={(e) => handleMoveTo("TODO", e)}
                  disabled={updatingStatus}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md transition cursor-pointer"
                  title="Move back to To Do"
                >
                  <FiArrowLeft size={11} />
                </button>
                <button
                  onClick={(e) => handleMoveTo("DONE", e)}
                  disabled={updatingStatus}
                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-md text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                  title="Mark as completed"
                >
                  <FiCheck size={11} />
                  <span>Done</span>
                </button>
              </>
            )}

            {task.status === "DONE" && (
              <button
                onClick={(e) => handleMoveTo("IN_PROGRESS", e)}
                disabled={updatingStatus}
                className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md text-[10px] flex items-center gap-1 transition cursor-pointer"
                title="Reopen task"
              >
                <FiArrowLeft size={11} />
                <span className="text-[10px]">Reopen</span>
              </button>
            )}
          </div>

          {/* ASSIGNEE AVATAR */}
          {task.assignee ? (
            <div
              className="relative shrink-0"
              title={`Assigned to ${task.assignee.name}`}
            >
              {task.assignee.image ? (
                <img
                  src={task.assignee.image}
                  alt={task.assignee.name}
                  className="w-6 h-6 rounded-full object-cover border border-indigo-200 ring-1 ring-white"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold flex items-center justify-center text-[10px] ring-1 ring-white shadow-2xs">
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
