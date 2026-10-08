"use client";

import Link from "next/link";
import {
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiFolder,
  FiCheckCircle,
} from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { Project, getUnifiedProjectMembers } from "@/lib/services/projectService";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onManageMembers: (project: Project) => void;
}

export function ProjectCard({
  project,
  onEdit,
  onDelete,
  onManageMembers,
}: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const teamMembers = getUnifiedProjectMembers(project);
  const isOwner = project.isOwner;

  return (
    <div className="group relative bg-white border border-slate-100 hover:border-indigo-100 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* CARD TOP */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100/80 text-indigo-600 flex items-center justify-center shrink-0">
              <FiFolder size={20} />
            </div>
            <div className="min-w-0">
              <Link
                href={`/projects/${project.id}`}
                className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition truncate block"
              >
                {project.name}
              </Link>
              <span
                className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                  isOwner
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                }`}
              >
                {isOwner ? "Owner" : "Member"}
              </span>
            </div>
          </div>

          {/* MENU ACTIONS */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer"
            >
              <FiMoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 w-44 bg-white border border-slate-100 rounded-xl shadow-lg p-1.5 z-20 animate-in fade-in zoom-in-95 duration-150">
                <Link
                  href={`/projects/${project.id}`}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <FiCheckCircle size={14} className="text-slate-400" />
                  View Details
                </Link>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onManageMembers(project);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                >
                  <FiUsers size={14} className="text-slate-400" />
                  {isOwner ? "Manage Members" : "See Members"}
                </button>
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onEdit(project);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                    >
                      <FiEdit2 size={14} className="text-slate-400" />
                      Edit Project
                    </button>
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete(project);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <FiTrash2 size={14} />
                      Delete Project
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DESCRIPTION */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {project.description || "No description provided for this project."}
        </p>
      </div>

      {/* CARD FOOTER */}
      <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
        {/* MEMBERS STACK */}
        <button
          onClick={() => onManageMembers(project)}
          className="flex items-center gap-1.5 hover:text-indigo-600 transition cursor-pointer"
          title={isOwner ? "Manage Members" : "See Members"}
        >
          <div className="flex -space-x-1.5 overflow-hidden">
            {teamMembers.slice(0, 3).map((m) =>
              m.image ? (
                <img
                  key={m.id}
                  src={m.image}
                  alt={m.name}
                  className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                />
              ) : (
                <span
                  key={m.id}
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-2 ring-white ${
                    m.isOwner
                      ? "bg-indigo-100 text-indigo-700"
                      : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {m.name.slice(0, 2).toUpperCase() || "U"}
                </span>
              )
            )}
          </div>
          <span className="text-[11px] font-medium text-slate-400 ml-1">
            {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
          </span>
        </button>

        {/* CREATED DATE */}
        <span className="text-[10px] text-slate-400">
          {new Date(project.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
