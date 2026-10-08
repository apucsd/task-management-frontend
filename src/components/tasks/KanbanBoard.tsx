"use client";

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
  borderClass: string;
  dotColor: string;
}

const columns: ColumnConfig[] = [
  {
    status: "TODO",
    title: "To Do",
    icon: FiList,
    accentBg: "bg-slate-100/80",
    accentText: "text-slate-700",
    borderClass: "border-slate-200/80",
    dotColor: "bg-slate-400",
  },
  {
    status: "IN_PROGRESS",
    title: "In Progress",
    icon: FiClock,
    accentBg: "bg-amber-50",
    accentText: "text-amber-800",
    borderClass: "border-amber-200/60",
    dotColor: "bg-amber-500",
  },
  {
    status: "DONE",
    title: "Completed",
    icon: FiCheckCircle,
    accentBg: "bg-emerald-50",
    accentText: "text-emerald-800",
    borderClass: "border-emerald-200/60",
    dotColor: "bg-emerald-500",
  },
];

export function KanbanBoard({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onAddNew,
}: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {columns.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);

        return (
          <div
            key={col.status}
            className="flex flex-col bg-slate-50/70 rounded-2xl p-4 border border-slate-200/70 min-h-[500px]"
          >
            {/* COLUMN HEADER */}
            <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-slate-200/60">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  {col.title}
                </h3>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.accentBg} ${col.accentText}`}
                >
                  {columnTasks.length}
                </span>
              </div>

              <button
                onClick={() => onAddNew(col.status)}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg shadow-2xs transition cursor-pointer"
                title={`Add task to ${col.title}`}
              >
                <FiPlus size={16} />
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
                <div className="h-44 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center p-4">
                  <p className="text-xs text-slate-400 font-medium mb-2">
                    No tasks in {col.title.toLowerCase()}
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
