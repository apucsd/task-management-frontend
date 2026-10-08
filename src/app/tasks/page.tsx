"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import {
  FiPlus,
  FiSearch,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
  FiX,
  FiUser,
  FiZap,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";
import {
  taskService,
  Task,
  TaskStatus,
  TaskPriority,
} from "@/lib/services/taskService";
import { projectService, Project } from "@/lib/services/projectService";
import { useAuth } from "@/context/AuthContext";
import { KanbanBoard } from "@/components/tasks/KanbanBoard";
import { TaskListView } from "@/components/tasks/TaskListView";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { EditTaskModal } from "@/components/tasks/EditTaskModal";
import { DeleteTaskModal } from "@/components/tasks/DeleteTaskModal";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

type ViewMode = "kanban" | "list";
type QuickTab = "all" | "my" | "urgent" | "in_progress" | "done";
type SortField = "createdAt" | "dueDate";

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  // Quick Tab
  const [activeTab, setActiveTab] = useState<QuickTab>("all");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus | "">("");
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | "">("");

  // Sorting (initially empty so no sort query param is sent until user selects)
  const [sortField, setSortField] = useState<SortField | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination (default limit 6 as requested)
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [initialCreateStatus, setInitialCreateStatus] =
    useState<TaskStatus>("TODO");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  // Load project list once for filter dropdown
  useEffect(() => {
    projectService
      .getAllProjects({ limit: 100 })
      .then((res) => setProjects(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch tasks with filters & backend sorting
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      let assigneeFilter: string | undefined = undefined;
      let statusFilter: TaskStatus | undefined = selectedStatus || undefined;
      let priorityFilter: TaskPriority | undefined = selectedPriority || undefined;

      if (activeTab === "my" && user?.id) {
        assigneeFilter = user.id;
      } else if (activeTab === "urgent") {
        priorityFilter = "HIGH";
      } else if (activeTab === "in_progress") {
        statusFilter = "IN_PROGRESS";
      } else if (activeTab === "done") {
        statusFilter = "DONE";
      }

      // Backend sort query format: prefix with '-' for descending, field name for ascending
      // Only sent when user explicitly selects a sort option
      const backendSort = sortField
        ? sortOrder === "desc"
          ? `-${sortField}`
          : sortField
        : undefined;

      const res = await taskService.getTasks({
        page: currentPage,
        limit: pageSize,
        searchTerm: searchTerm.trim() || undefined,
        projectId: selectedProject || undefined,
        status: statusFilter,
        priority: priorityFilter,
        assigneeId: assigneeFilter,
        sort: backendSort,
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
    pageSize,
    activeTab,
    user?.id,
    searchTerm,
    selectedProject,
    selectedStatus,
    selectedPriority,
    sortField,
    sortOrder,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Quick stats derived from loaded tasks or counts
  const totalTasksCount = totalCount;
  const inProgressCount = tasks.filter(
    (t) => t.status === "IN_PROGRESS",
  ).length;
  const completedCount = tasks.filter((t) => t.status === "DONE").length;
  const highPriorityCount = tasks.filter((t) => t.priority === "HIGH").length;

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedProject("");
    setSelectedStatus("");
    setSelectedPriority("");
    setSortField("");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchTerm) ||
    Boolean(selectedProject) ||
    Boolean(selectedStatus) ||
    Boolean(selectedPriority) ||
    Boolean(sortField);

  const handleOpenCreate = (status: TaskStatus = "TODO") => {
    setInitialCreateStatus(status);
    setCreateOpen(true);
  };

  const handleStatusChangeLocal = async (taskId: string, newStatus: TaskStatus) => {
    // Find current task to revert if needed
    const currentTask = tasks.find((t) => t.id === taskId);
    if (!currentTask || currentTask.status === newStatus) return;

    const previousStatus = currentTask.status;

    // 1. Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)),
    );

    // 2. Persist to backend
    try {
      await taskService.updateTaskStatus(taskId, newStatus);
      const label =
        newStatus === "DONE"
          ? "Completed"
          : newStatus === "IN_PROGRESS"
          ? "In Progress"
          : "To Do";
      toast.success(`Task moved to ${label}`);
    } catch (err: any) {
      // Revert optimistic update on failure
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: previousStatus } : t)),
      );
      toast.error(getApiErrorMessage(err));
    }
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
                <p className="text-[11px] font-medium text-slate-400">
                  Total Tasks
                </p>
                <p className="text-xs font-bold text-slate-800">
                  All registered
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FiClock size={16} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  In Progress
                </p>
                <p className="text-xs font-bold text-amber-700">
                  {inProgressCount} active
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FiCheckCircle size={16} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  Completed
                </p>
                <p className="text-xs font-bold text-emerald-700">
                  {completedCount} done
                </p>
              </div>
            </div>

            <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <FiAlertCircle size={16} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-slate-400">
                  High Priority
                </p>
                <p className="text-xs font-bold text-rose-700">
                  {highPriorityCount} urgent
                </p>
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

              {/* SORT BY FILTER */}
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-xl px-1">
                <select
                  value={sortField}
                  onChange={(e) => {
                    setSortField(e.target.value as SortField | "");
                    setCurrentPage(1);
                  }}
                  className="px-2 py-2 bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
                  title="Sort tasks by"
                >
                  <option value="">Default Order</option>
                  <option value="createdAt">Date Created</option>
                  <option value="dueDate">Due Date</option>
                </select>
                <button
                  onClick={() => {
                    if (!sortField) {
                      setSortField("createdAt");
                    }
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                    setCurrentPage(1);
                  }}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    sortField
                      ? "text-slate-600 hover:text-indigo-600"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                  title={sortOrder === "asc" ? "Ascending order" : "Descending order"}
                >
                  {sortOrder === "asc" ? <FiArrowUp size={13} /> : <FiArrowDown size={13} />}
                </button>
              </div>

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
                <FiRefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
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
          ) : (
            <div className="space-y-4">
              {viewMode === "kanban" ? (
                <KanbanBoard
                  tasks={tasks}
                  onEdit={(task) => setEditingTask(task)}
                  onDelete={(task) => setDeletingTask(task)}
                  onStatusChange={handleStatusChangeLocal}
                  onAddNew={(status) => handleOpenCreate(status)}
                />
              ) : (
                <TaskListView
                  tasks={tasks}
                  onEdit={(task) => setEditingTask(task)}
                  onDelete={(task) => setDeletingTask(task)}
                  onStatusChange={handleStatusChangeLocal}
                />
              )}

              {/* ADVANCED PAGINATION BAR - ALWAYS VISIBLE */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>
                    Showing{" "}
                    <strong className="text-slate-800">
                      {totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1}
                    </strong>{" "}
                    to{" "}
                    <strong className="text-slate-800">
                      {Math.min(currentPage * pageSize, totalCount)}
                    </strong>{" "}
                    of <strong className="text-slate-800">{totalCount}</strong> tasks
                  </span>

                  {/* PAGE SIZE SELECTOR */}
                  <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                    <span className="text-slate-400">Show:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value={6}>6 per page</option>
                      <option value={12}>12 per page</option>
                      <option value={24}>24 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1 || loading}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Previous page"
                  >
                    <FiChevronLeft size={15} />
                  </button>

                  {/* NUMBERED PAGE PILLS */}
                  {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loading}
                      className={`w-8 h-8 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        pageNum === currentPage
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "hover:bg-slate-100 text-slate-600 border border-slate-200/80 bg-white"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage >= totalPages || loading}
                    className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                    title="Next page"
                  >
                    <FiChevronRight size={15} />
                  </button>
                </div>
              </div>
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
