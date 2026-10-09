"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import {
  FiPlus,
  FiSearch,
  FiFolder,
  FiLayers,
  FiShield,
  FiUsers,
  FiChevronLeft,
  FiChevronRight,
  FiRefreshCw,
} from "react-icons/fi";
import { projectService, Project } from "@/lib/services/projectService";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import { DeleteProjectModal } from "@/components/projects/DeleteProjectModal";
import { ManageMembersModal } from "@/components/projects/ManageMembersModal";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

type FilterType = "all" | "owned" | "member";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [membersProject, setMembersProject] = useState<Project | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getAllProjects({
        page: currentPage,
        limit: 9,
        searchTerm: searchTerm.trim() || undefined,
        type: filterType,
      });
      setProjects(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotalCount(res.meta?.total || 0);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterType]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Projects
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {totalCount} total
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Collaborate with your team, manage milestones, and organize project tasks
              </p>
            </div>

            <button
              onClick={() => setCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition self-start sm:self-auto cursor-pointer"
            >
              <FiPlus size={16} strokeWidth={2.2} />
              New Project
            </button>
          </div>

          {/* FILTER & SEARCH CONTROLS */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-100">
            {/* TABS */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/70 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => {
                  setFilterType("all");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterType === "all"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FiLayers size={13} /> All
              </button>
              <button
                onClick={() => {
                  setFilterType("owned");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterType === "owned"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FiShield size={13} /> Owned by Me
              </button>
              <button
                onClick={() => {
                  setFilterType("member");
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterType === "member"
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <FiUsers size={13} /> Shared with Me
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div className="relative w-full sm:w-72">
              <FiSearch
                className="absolute left-3 top-2.5 text-slate-400"
                size={15}
              />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200/70 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* PROJECT LIST */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs animate-pulse space-y-3"
                >
                  <div className="h-6 w-1/2 bg-slate-100 rounded-lg" />
                  <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
                  <div className="h-4 w-full bg-slate-100 rounded-lg" />
                  <div className="pt-4 border-t border-slate-50 flex justify-between">
                    <div className="h-5 w-20 bg-slate-100 rounded-full" />
                    <div className="h-4 w-16 bg-slate-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center max-w-md mx-auto space-y-4 my-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <FiFolder size={26} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  No projects found
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {searchTerm
                    ? `No projects matched "${searchTerm}". Try a different search term.`
                    : "You don't have any projects in this view yet. Create your first project to get started!"}
                </p>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                <FiPlus size={16} />
                Create New Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onEdit={(p) => setEditingProject(p)}
                  onDelete={(p) => setDeletingProject(p)}
                  onManageMembers={(p) => setMembersProject(p)}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-500">
              <span>
                Showing page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <FiChevronLeft size={16} />
                </button>
                <span className="font-semibold text-slate-800 px-2">
                  {currentPage}
                </span>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition"
                >
                  <FiChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={fetchProjects}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSuccess={fetchProjects}
      />

      <DeleteProjectModal
        isOpen={!!deletingProject}
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onSuccess={fetchProjects}
      />

      <ManageMembersModal
        isOpen={!!membersProject}
        project={membersProject}
        onClose={() => setMembersProject(null)}
        onSuccess={fetchProjects}
      />
    </div>
  );
}
