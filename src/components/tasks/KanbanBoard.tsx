"use client";

import { useState } from "react";
import { FiPlus, FiCheckCircle, FiClock, FiList } from "react-icons/fi";
import { Task, TaskStatus } from "@/lib/services/taskService";
import { TaskCard } from "./TaskCard";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
  onAddNew: (status: TaskStatus) => void;
}

interface ColumnConfig {
  status: TaskStatus;
  title: string;
  icon: typeof FiList;
  accentBg: string;
  accentText: string;
  dotColor: string;
  badgeBorder: string;
}

const columns: ColumnConfig[] = [
  {
    status: "TODO",
    title: "To Do",
    icon: FiList,
    accentBg: "bg-slate-100/90",
    accentText: "text-slate-700",
    dotColor: "bg-slate-400",
    badgeBorder: "border-slate-200/80",
  },
  {
    status: "IN_PROGRESS",
    title: "In Progress",
    icon: FiClock,
    accentBg: "bg-amber-100/80",
    accentText: "text-amber-800",
    dotColor: "bg-amber-500",
    badgeBorder: "border-amber-200/80",
  },
  {
    status: "DONE",
    title: "Completed",
    icon: FiCheckCircle,
    accentBg: "bg-emerald-100/80",
    accentText: "text-emerald-800",
    dotColor: "bg-emerald-500",
    badgeBorder: "border-emerald-200/80",
  },
];

export function KanbanBoard({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNew,
}: KanbanBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverCol !== status) {
      setDragOverCol(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent, status: TaskStatus) => {
    // Only clear if leaving this column
    if (dragOverCol === status) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        const isDragOver = dragOverCol === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => handleDragOver(e, col.status)}
            onDragLeave={(e) => handleDragLeave(e, col.status)}
            onDrop={(e) => handleDrop(e, col.status)}
            className={`flex flex-col rounded-3xl p-4.5 border transition-all duration-200 min-h-[520px] ${
              isDragOver
                ? "bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200/60 shadow-md scale-[1.01]"
                : "bg-slate-50/70 border-slate-200/70"
            }`}
          >
            {/* COLUMN HEADER */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {col.title}
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${col.accentBg} ${col.accentText} ${col.badgeBorder}`}
                >
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onAddNew(col.status)}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg shadow-2xs text-xs font-semibold transition cursor-pointer border border-transparent hover:border-slate-200/60"
                title={`Add task to ${col.title}`}
              >
                <FiPlus size={14} />
                <span className="text-[11px]">Add</span>
              </button>
            </div>

            {/* TASK CARDS CONTAINER */}
            <div className="space-y-3 flex-1">
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))
              ) : (
                <div
                  className={`h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-4 transition ${
                    isDragOver
                      ? "border-indigo-400 bg-white/80"
                      : "border-slate-200/80 bg-slate-50/40"
                  }`}
                >
                  <p className="text-xs text-slate-400 font-medium mb-2">
                    {isDragOver ? "Drop task here" : `No tasks in ${col.title.toLowerCase()}`}
                  </p>
                  <button
                    onClick={() => onAddNew(col.status)}
                    className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:text-indigo-700 hover:underline cursor-pointer"
                  >
                    <FiPlus size={13} />
                    Add Task
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
