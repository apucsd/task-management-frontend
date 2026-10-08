"use client";

import { useState, useEffect, useCallback, use, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import {
  FiArrowLeft,
  FiFolder,
  FiCalendar,
  FiShield,
  FiUsers,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";
import {
  projectService,
  Project,
  getUnifiedProjectMembers,
} from "@/lib/services/projectService";
import { EditProjectModal } from "@/components/projects/EditProjectModal";
import { DeleteProjectModal } from "@/components/projects/DeleteProjectModal";
import { ManageMembersModal } from "@/components/projects/ManageMembersModal";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";

function ProjectDetailsContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [membersOpen, setMembersOpen] = useState(false);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await projectService.getProjectById(projectId);
      setProject(res.data);
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
      router.push("/projects");
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <FiLoader className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!project) return null;

  const teamMembers = getUnifiedProjectMembers(project);

  return (
    <main className="p-8 max-w-7xl mx-auto w-full space-y-6 flex-1">
      {/* BACK LINK */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
      >
        <FiArrowLeft size={14} />
        Back to Projects
      </Link>

      {/* PROJECT HERO CARD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <FiFolder size={26} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {project.name}
                </h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    project.isOwner
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  }`}
                >
                  {project.isOwner ? "Owner" : "Member"}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
                {project.description ||
                  "No detailed description provided for this project."}
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 self-start">
            <button
              onClick={() => setMembersOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              {project.isOwner ? (
                <FiUserPlus size={14} />
              ) : (
                <FiUsers size={14} />
              )}
              {project.isOwner ? "Members" : "See Members"}
            </button>

            {project.isOwner && (
              <>
                <button
                  onClick={() => setEditOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <FiEdit2 size={14} />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* META INFO BAR */}
        <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-slate-400" size={16} />
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {new Date(project.createdAt).toLocaleDateString("en-US", {
                  dateStyle: "medium",
                })}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiUsers className="text-slate-400" size={16} />
            <span>
              Team:{" "}
              <strong className="text-slate-700">
                {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <FiShield className="text-slate-400" size={16} />
            <span>
              Project Lead:{" "}
              <strong className="text-slate-700">
                {project.owner?.name}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* PROJECT MEMBERS SECTION */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Team Members
            </h2>
            <p className="text-xs text-slate-500">
              People collaborating on tasks in this project
            </p>
          </div>
          <button
            onClick={() => setMembersOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            {project.isOwner ? <FiUserPlus size={13} /> : <FiUsers size={13} />}
            {project.isOwner ? "Manage Members" : "See Members"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                member.isOwner
                  ? "border-indigo-100 bg-indigo-50/40"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-white shrink-0"
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                      member.isOwner
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {member.name.slice(0, 2).toUpperCase() || "U"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {member.email}
                  </p>
                </div>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  member.isOwner
                    ? "text-indigo-700 bg-white border-indigo-200"
                    : "text-slate-500 bg-white border-slate-200"
                }`}
              >
                {member.isOwner ? "Owner" : "Member"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* MODALS */}
      <EditProjectModal
        isOpen={editOpen}
        project={project}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchProjectDetails}
      />

      <DeleteProjectModal
        isOpen={deleteOpen}
        project={project}
        onClose={() => setDeleteOpen(false)}
        onSuccess={() => router.push("/projects")}
      />

      <ManageMembersModal
        isOpen={membersOpen}
        project={project}
        onClose={() => setMembersOpen(false)}
        onSuccess={fetchProjectDetails}
      />
    </main>
  );
}

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center p-8">
              <FiLoader className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          }
        >
          <ProjectDetailsContent params={params} />
        </Suspense>
      </div>
    </div>
  );
}
