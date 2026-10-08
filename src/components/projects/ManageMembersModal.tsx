"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FiX,
  FiUsers,
  FiUserPlus,
  FiTrash2,
  FiSearch,
  FiLoader,
  FiShield,
  FiCheck,
} from "react-icons/fi";
import {
  projectService,
  Project,
  ProjectUser,
  getUnifiedProjectMembers,
} from "@/lib/services/projectService";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/lib/api";
import { toast } from "sonner";

interface ManageMembersModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ManageMembersModal({
  isOpen,
  project,
  onClose,
  onSuccess,
}: ManageMembersModalProps) {
  const { user: currentUser } = useAuth();
  const [currentProject, setCurrentProject] = useState<Project | null>(project);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ProjectUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ProjectUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Sync state
  useEffect(() => {
    setCurrentProject(project);
    if (project?.id) {
      projectService
        .getProjectById(project.id)
        .then((res) => {
          if (res.data) setCurrentProject(res.data);
        })
        .catch(() => {});
    }
  }, [project, isOpen]);

  // Fetch available platform users that can be invited
  const loadAvailableUsers = useCallback(
    async (query: string = "") => {
      if (!currentProject) return;
      setSearching(true);
      try {
        const users = await projectService.searchUsers(query.trim());
        const existingUserIds = new Set([
          currentProject.ownerId,
          ...(currentProject.members?.map((m) => m.userId) || []),
        ]);
        setSearchResults(users.filter((u) => !existingUserIds.has(u.id)));
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    },
    [currentProject]
  );

  // Fetch users when modal opens
  useEffect(() => {
    if (isOpen && currentProject) {
      loadAvailableUsers("");
    }
  }, [isOpen, currentProject?.id, loadAvailableUsers]);

  // Debounced search on query change
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      loadAvailableUsers(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, isOpen, loadAvailableUsers]);

  if (!isOpen || !currentProject) return null;

  const isOwner =
    currentProject.isOwner || currentProject.ownerId === currentUser?.id;

  const teamMembers = getUnifiedProjectMembers(currentProject);

  const handleAddMember = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await projectService.addMember(currentProject.id, selectedUser.id);
      toast.success(`${selectedUser.name} added to project!`);
      setSelectedUser(null);
      setSearchQuery("");

      // Refresh project & available users
      const updated = await projectService.getProjectById(currentProject.id);
      if (updated.data) {
        setCurrentProject(updated.data);
      }
      loadAvailableUsers("");
      onSuccess();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    setActionLoading(true);
    try {
      await projectService.removeMember(currentProject.id, memberId);
      toast.success(`${memberName} removed from project`);

      // Refresh project & available users
      const updated = await projectService.getProjectById(currentProject.id);
      if (updated.data) {
        setCurrentProject(updated.data);
      }
      loadAvailableUsers("");
      onSuccess();
    } catch (err: any) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FiUsers size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {isOwner ? "Manage Members" : "See Members"}
              </h2>
              <p className="text-xs text-slate-500">
                {isOwner ? "Manage team access for " : "See team members of "}
                <span className="font-semibold text-slate-700">
                  {currentProject.name}
                </span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition cursor-pointer"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* ADD MEMBER SECTION (OWNER ONLY) */}
          {isOwner && (
            <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <FiUserPlus size={14} className="text-indigo-600" />
                Invite Team Member
              </h3>

              <div className="relative">
                <FiSearch
                  className="absolute left-3 top-2.5 text-slate-400"
                  size={15}
                />
                <input
                  type="text"
                  placeholder="Search registered user by name or email..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition"
                />
                {searching && (
                  <FiLoader
                    className="absolute right-3 top-2.5 text-indigo-500 animate-spin"
                    size={14}
                  />
                )}
              </div>

              {/* SEARCH RESULTS LIST */}
              {searchResults.length > 0 && (
                <div className="max-h-44 overflow-y-auto bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 shadow-xs">
                  {searchResults.map((u) => {
                    const isSelected = selectedUser?.id === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUser(u)}
                        className={`p-2.5 flex items-center justify-between cursor-pointer transition text-xs ${
                          isSelected
                            ? "bg-indigo-50 border-l-4 border-indigo-600"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {u.image ? (
                            <img
                              src={u.image}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                              {u.name?.slice(0, 2).toUpperCase() || "U"}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {u.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="flex items-center gap-1 text-[11px] text-indigo-600 font-bold">
                            <FiCheck size={13} /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Click to select
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {searchResults.length === 0 && !searching && (
                <p className="text-[11px] text-slate-400 italic px-1">
                  {searchQuery
                    ? `No users found matching "${searchQuery}"`
                    : "All registered users are already members of this project."}
                </p>
              )}

              {/* SELECTED USER CONFIRMATION BAR */}
              {selectedUser && (
                <div className="flex items-center justify-between p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs">
                  <span className="text-slate-800 text-[11px] truncate">
                    Ready to add: <strong>{selectedUser.name}</strong>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-[11px] text-slate-500 hover:text-slate-700 font-medium px-2 py-1"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleAddMember}
                      disabled={actionLoading}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading && (
                        <FiLoader className="animate-spin" size={12} />
                      )}
                      Add to Project
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CURRENT MEMBERS LIST */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Current Team</span>
              <span className="text-[11px] text-slate-400 font-medium">
                {teamMembers.length} {teamMembers.length === 1 ? "member" : "members"}
              </span>
            </h3>

            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${
                          member.isOwner
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-700"
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

                  <div className="flex items-center gap-2 shrink-0">
                    {member.isOwner ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                        <FiShield size={12} /> Owner
                      </span>
                    ) : (
                      <>
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Member
                        </span>
                        {isOwner && (
                          <button
                            onClick={() =>
                              handleRemoveMember(member.id, member.name)
                            }
                            disabled={actionLoading}
                            title="Remove Member"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          >
                            <FiTrash2 size={14} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
