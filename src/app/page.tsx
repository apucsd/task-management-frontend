"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { useAuth } from "@/context/AuthContext";
import { projectService, Project } from "@/lib/services/projectService";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import { DeleteProjectModal } from "@/components/projects/DeleteProjectModal";
import { ManageMembersModal } from "@/components/projects/ManageMembersModal";
import { FiArrowRight, FiFolder } from "react-icons/fi";

export default function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Project Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [membersProject, setMembersProject] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await projectService.getAllProjects({ page: 1, limit: 3 });
      setProjects(res.data || []);
    } catch {
      // Handled silently for dashboard
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 flex-1">
          <DashboardHeader
            name={user?.name || "User"}
            onNewProject={() => setCreateOpen(true)}
          />

          <StatsGrid />

          {/* RECENT PROJECTS SECTION */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Recent Projects
                </h2>
                <p className="text-xs text-slate-500">
                  Quick access to your active workspaces
                </p>
              </div>
              <Link
                href="/projects"
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                View all projects <FiArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs animate-pulse space-y-3"
                  >
                    <div className="h-6 w-1/2 bg-slate-100 rounded-lg" />
                    <div className="h-4 w-3/4 bg-slate-100 rounded-lg" />
                    <div className="h-4 w-full bg-slate-100 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <FiFolder size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    No active projects
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Create a project to start organizing your tasks
                  </p>
                </div>
                <button
                  onClick={() => setCreateOpen(true)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Create Project
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
          </section>
        </main>
      </div>

      {/* PROJECT MODALS */}
      <CreateProjectModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={loadProjects}
      />

      <EditProjectModal
        isOpen={!!editingProject}
        project={editingProject}
        onClose={() => setEditingProject(null)}
        onSuccess={loadProjects}
      />

      <DeleteProjectModal
        isOpen={!!deletingProject}
        project={deletingProject}
        onClose={() => setDeletingProject(null)}
        onSuccess={loadProjects}
      />

      <ManageMembersModal
        isOpen={!!membersProject}
        project={membersProject}
        onClose={() => setMembersProject(null)}
        onSuccess={loadProjects}
      />
    </div>
  );
}
