import { api } from "@/lib/api";

export interface ProjectUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface ProjectMember {
  id: string;
  userId: string;
  user: ProjectUser;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: ProjectUser;
  members: ProjectMember[];
  _count?: {
    members?: number;
    tasks?: number;
  };
  isOwner?: boolean;
}

export interface UnifiedProjectMember {
  id: string; // memberId or ownerId
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  isOwner: boolean;
}

export function getUnifiedProjectMembers(
  project: Project | null | undefined
): UnifiedProjectMember[] {
  if (!project) return [];
  const seenIds = new Set<string>();
  const seenEmails = new Set<string>();
  const list: UnifiedProjectMember[] = [];

  const ownerId = project.owner?.id || project.ownerId;
  const ownerEmail = project.owner?.email?.toLowerCase();

  // 1. Add owner first
  if (ownerId || project.owner) {
    if (ownerId) seenIds.add(ownerId);
    if (ownerEmail) seenEmails.add(ownerEmail);

    const ownerMemberRecord = project.members?.find(
      (m) =>
        (ownerId && (m.userId === ownerId || m.user?.id === ownerId)) ||
        (ownerEmail && m.user?.email?.toLowerCase() === ownerEmail)
    );

    list.push({
      id: ownerMemberRecord?.id || ownerId || "owner",
      userId: ownerId || "",
      name: project.owner?.name || "Owner",
      email: project.owner?.email || "",
      image: project.owner?.image,
      isOwner: true,
    });
  }

  // 2. Add members, skipping anyone matching owner ID or email
  project.members?.forEach((m) => {
    const uId = m.userId || m.user?.id;
    const uEmail = m.user?.email?.toLowerCase();

    const isDuplicate =
      (uId && seenIds.has(uId)) ||
      (uEmail && seenEmails.has(uEmail)) ||
      (ownerId && uId === ownerId) ||
      (ownerEmail && uEmail === ownerEmail);

    if (!isDuplicate) {
      if (uId) seenIds.add(uId);
      if (uEmail) seenEmails.add(uEmail);

      list.push({
        id: m.id,
        userId: uId || m.id,
        name: m.user?.name || "Member",
        email: m.user?.email || "",
        image: m.user?.image,
        isOwner: false,
      });
    }
  });

  return list;
}

export interface ProjectsQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  type?: "all" | "owned" | "member";
}

export interface ProjectsListResponse {
  success: boolean;
  message: string;
  data: Project[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SingleProjectResponse {
  success: boolean;
  message: string;
  data: Project;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export const projectService = {
  // 1. Get all projects
  async getAllProjects(params?: ProjectsQueryParams): Promise<ProjectsListResponse> {
    const res = await api.get<ProjectsListResponse>("/projects", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 12,
        searchTerm: params?.searchTerm || undefined,
        type: params?.type !== "all" ? params?.type : undefined,
      },
    });
    return res.data;
  },

  // Alias for getAllProjects
  async getProjects(params?: ProjectsQueryParams): Promise<ProjectsListResponse> {
    return this.getAllProjects(params);
  },

  // 2. Get single project by ID
  async getProjectById(id: string): Promise<SingleProjectResponse> {
    const res = await api.get<SingleProjectResponse>(`/projects/${id}`);
    return res.data;
  },

  // 3. Create project
  async createProject(data: CreateProjectInput): Promise<SingleProjectResponse> {
    const res = await api.post<SingleProjectResponse>("/projects", data);
    return res.data;
  },

  // 4. Update project (Owner only)
  async updateProject(id: string, data: UpdateProjectInput): Promise<SingleProjectResponse> {
    const res = await api.patch<SingleProjectResponse>(`/projects/${id}`, data);
    return res.data;
  },

  // 5. Delete project (Owner only)
  async deleteProject(id: string): Promise<{ success: boolean; message: string }> {
    const res = await api.delete(`/projects/${id}`);
    return res.data;
  },

  // 6. Add member to project (Owner only)
  async addMember(projectId: string, userId: string): Promise<any> {
    const res = await api.post(`/projects/${projectId}/members`, { userId });
    return res.data;
  },

  // 7. Remove member or leave project
  async removeMember(projectId: string, memberId: string): Promise<any> {
    const res = await api.delete(`/projects/${projectId}/members/${memberId}`);
    return res.data;
  },

  // Helper: Search users to invite
  async searchUsers(searchTerm: string = ""): Promise<ProjectUser[]> {
    try {
      const res = await api.get("/users", {
        params: {
          limit: 15,
          searchTerm: searchTerm || undefined,
          status: "ACTIVE",
        },
      });
      return res.data?.data || [];
    } catch {
      return [];
    }
  },
};
