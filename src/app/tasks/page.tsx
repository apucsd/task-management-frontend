"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import {
  FiPlus,
  FiSearch,
  FiFilter,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
} from "react-icons/fi";
import {
  taskService,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/lib/services/taskService";
import { projectService, Project } from "@/lib/services/projectService";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { DeleteTaskModal } from "@/components/tasks/DeleteTaskModal";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

type ViewMode = "kanban" | "list";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "">("");
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [initialCreateStatus, setInitialCreateStatus] = useState<TaskStatus>("TODO");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Load project list once for filter dropdown
  useEffect(() => {
    projectService
      .getAllProjects({ limit: 100 })
      .then((res) => setProjects(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch tasks with filters
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks({
        page: currentPage,
        limit: viewMode === "kanban" ? 50 : 15,
        searchTerm: searchTerm.trim() || undefined,
        projectId: selectedProject || undefined,
        status: selectedStatus || undefined,
        priority: selectedPriority || undefined,
      });

      setTasks(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    viewMode,
    searchTerm,
    selectedProject,
    selectedStatus,
    selectedPriority,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Quick stats derived from loaded tasks or counts
  const totalTasksCount = totalCount;
  const inProgressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const completedCount = tasks.filter((t) => t.status === "DONE").length;
  const highPriorityCount = tasks.filter((t) => t.priority === "HIGH").length;

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedProject("");
    setSelectedStatus("");
    setSelectedPriority("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedProject) ||
    Boolean(selectedStatus) ||
    Boolean(selectedPriority);

  const handleOpenCreate = (status: TaskStatus = "TODO") => {
    setInitialCreateStatus(status);
    setCreateOpen(true);
  };

  const handleStatusChangeLocal = (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
          {/* PAGE HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Tasks
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {totalTasksCount} Total
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage, organize, and prioritize your team deliverables
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {/* VIEW SWITCHER */}
              <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
                <button
                  onClick={() => setViewMode("kanban")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === "kanban"
                      ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Kanban Board view"
                >
                  <FiGrid size={13} />
                  Board
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    viewMode === "list"
                      ? "bg-indigo-50 text-indigo-700 shadow-2xs"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Table List view"
                >
                  <FiList size={13} />
                  List
                </button>
              </div>

              {/* CREATE TASK BUTTON */}
              <button
                onClick={() => handleOpenCreate("TODO")}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition cursor-pointer shrink-0"
              >
                <FiPlus size={15} />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* QUICK METRICS BAR */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                {totalTasksCount}
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Total Tasks</p>
                <p className="text-xs font-bold text-slate-800">All registered</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiClock size={16} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">In Progress</p>
                <p className="text-xs font-bold text-amber-700">{inProgressCount} active</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiCheckCircle size={16} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">Completed</p>
                <p className="text-xs font-bold text-emerald-700">{completedCount} done</p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <FiAlertCircle size={16} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">High Priority</p>
                <p className="text-xs font-bold text-rose-700">{highPriorityCount} urgent</p>
              </div>
            </div>
          </div>

          {/* FILTER & SEARCH BAR */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* SEARCH */}
            <div className="relative flex-1">
              <FiSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search tasks by title..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* DROPDOWN FILTERS */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* PROJECT FILTER */}
              <select
                value={selectedProject}
                onChange={(e) => {
                  setSelectedProject(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* STATUS FILTER (Especially useful in List view) */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value as TaskStatus | "");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>

              {/* PRIORITY FILTER */}
              <select
                value={selectedPriority}
                onChange={(e) => {
                  setSelectedPriority(e.target.value as TaskPriority | "");
                  setCurrentPage(1);
                }}
                className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
              >
                <option value="">All Priorities</option>
                <option value="HIGH">High Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="LOW">Low Priority</option>
              </select>

              {/* CLEAR FILTERS */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 px-2.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition cursor-pointer"
                  title="Clear all filters"
                >
                  <FiX size={13} />
                  Clear
                </button>
              )}

              {/* REFRESH */}
              <button
                onClick={fetchTasks}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Refresh tasks"
              >
                <FiRefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3 min-h-[350px] animate-pulse"
                >
                  <div className="h-6 w-24 bg-slate-200 rounded-md" />
                  <div className="h-28 bg-white rounded-xl border border-slate-100" />
                  <div className="h-28 bg-white rounded-xl border border-slate-100" />
                </div>
              ))}
            </div>
          ) : viewMode === "kanban" ? (
            <KanbanBoard
              tasks={tasks}
              onEdit={(task) => setEditingTask(task)}
              onDelete={(task) => setDeletingTask(task)}
              onStatusChange={handleStatusChangeLocal}
              onAddNew={(status) => handleOpenCreate(status)}
            />
          ) : (
            <div className="space-y-4">
              <TaskListView
                tasks={tasks}
                onEdit={(task) => setEditingTask(task)}
                onDelete={(task) => setDeletingTask(task)}
                onStatusChange={handleStatusChangeLocal}
              />

              {/* PAGINATION (IN LIST VIEW) */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-500">
                    Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
                    <strong className="text-slate-800">{totalPages}</strong>
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage >= totalPages}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <CreateTaskModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchTasks}
        initialStatus={initialCreateStatus}
        initialProjectId={selectedProject || undefined}
      />

      <EditTaskModal
        isOpen={Boolean(editingTask)}
        onClose={() => setEditingTask(null)}
        onSuccess={fetchTasks}
        task={editingTask}
      />

      <DeleteTaskModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onSuccess={fetchTasks}
        task={deletingTask}
      />
    </div>
  );
}
