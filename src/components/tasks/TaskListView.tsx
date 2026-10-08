"use client";

import {
  Task,
  TaskStatus,
  TaskPriority,
  taskService,
} from "@/lib/services/taskService";
import {
  FiCheckCircle,
  FiCircle,
  FiCalendar,
  FiFolder,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

interface TaskListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

export function TaskListView({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}: TaskListViewProps) {
  const priorityConfig: Record<
    TaskPriority,
    { label: string; bg: string; text: string }
  > = {
    HIGH: { label: "High", bg: "bg-rose-50 border-rose-200", text: "text-rose-700" },
    MEDIUM: {
      label: "Medium",
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
    },
    LOW: { label: "Low", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  };

  const statusConfig: Record<TaskStatus, { label: string; badge: string }> = {
    TODO: { label: "To Do", badge: "bg-slate-100 text-slate-700" },
    IN_PROGRESS: { label: "In Progress", badge: "bg-amber-50 text-amber-700 border border-amber-200/60" },
    DONE: { label: "Completed", badge: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
  };

  const handleToggle = async (task: Task) => {
    const nextStatus: TaskStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      await taskService.updateTaskStatus(task.id, nextStatus);
      toast.success(nextStatus === "DONE" ? "Completed!" : "Moved to To Do");
      onStatusChange(task.id, nextStatus);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    }
  };

  const handleStatusChange = async (task: Task, newStatus: TaskStatus) => {
    if (newStatus === task.status) return;
    try {
      await taskService.updateTaskStatus(task.id, newStatus);
      toast.success(`Updated status to ${newStatus}`);
      onStatusChange(task.id, newStatus);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-100">
        <p className="text-sm font-semibold text-slate-700">No tasks found</p>
        <p className="text-xs text-slate-400 mt-1">
          Try adjusting your search or filters to see more tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-3.5 px-4 w-10">Done</th>
              <th className="py-3.5 px-4">Task</th>
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Priority</th>
              <th className="py-3.5 px-4">Assignee</th>
              <th className="py-3.5 px-4">Due Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const pConf = priorityConfig[task.priority] || priorityConfig.MEDIUM;
              const isOverdue =
                task.dueDate &&
                task.status !== "DONE" &&
                new Date(task.dueDate).getTime() < Date.now();

              return (
                <tr
                  key={task.id}
                  className="hover:bg-slate-50/60 transition group"
                >
                  {/* DONE CHECKBOX */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggle(task)}
                      className="cursor-pointer transition text-slate-300 hover:text-indigo-600"
                    >
                      {task.status === "DONE" ? (
                        <FiCheckCircle size={18} className="text-emerald-500 fill-emerald-50" />
                      ) : (
                        <FiCircle size={18} />
                      )}
                    </button>
                  </td>

                  {/* TITLE & DESCRIPTION */}
                  <td className="py-3 px-4 max-w-xs sm:max-w-md">
                    <div className="font-semibold text-slate-900 truncate">
                      <span
                        className={
                          task.status === "DONE" ? "line-through text-slate-400" : ""
                        }
                      >
                        {task.title}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </td>

                  {/* PROJECT */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {task.project ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                        <FiFolder size={11} className="text-slate-400" />
                        <span className="max-w-[120px] truncate">
                          {task.project.name}
                        </span>
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  {/* STATUS SELECT */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      onChange={(e) =>
                        handleStatusChange(task, e.target.value as TaskStatus)
                      }
                      className={`text-[11px] font-semibold px-2 py-1 rounded-md border-0 focus:ring-1 focus:ring-indigo-500 cursor-pointer ${
                        statusConfig[task.status]?.badge || "bg-slate-100"
                      }`}
                    >
                      <option value="TODO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="DONE">Completed</option>
                    </select>
                  </td>

                  {/* PRIORITY */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${pConf.bg} ${pConf.text}`}
                    >
                      {pConf.label}
                    </span>
                  </td>

                  {/* ASSIGNEE */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {task.assignee ? (
                      <div className="flex items-center gap-2">
                        {task.assignee.image ? (
                          <img
                            src={task.assignee.image}
                            alt={task.assignee.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[9px]">
                            {task.assignee.name.slice(0, 2).toUpperCase() || "U"}
                          </div>
                        )}
                        <span className="text-[11px] font-medium text-slate-700 max-w-[100px] truncate">
                          {task.assignee.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Unassigned</span>
                    )}
                  </td>

                  {/* DUE DATE */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    {task.dueDate ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          isOverdue ? "text-rose-600 font-semibold" : "text-slate-600"
                        }`}
                      >
                        <FiCalendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {isOverdue && (
                          <span className="text-[9px] px-1 bg-rose-100 text-rose-700 rounded">
                            Overdue
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">-</span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(task)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit Task"
                      >
                        <FiEdit2 size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(task)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Task"
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
