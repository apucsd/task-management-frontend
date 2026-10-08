import { api, ApiResponse, PaginatedResponse } from "@/lib/api";
import type {
  Project,
  ProjectUser,
  ProjectMember,
  UnifiedProjectMember,
  ProjectsQueryParams,
  CreateProjectInput,
  UpdateProjectInput,
} from "@/types/project";
import { getUnifiedProjectMembers } from "@/lib/projectUtils";

// Re-export types and helpers for clean backwards compatibility
export type {
  Project,
  ProjectUser,
  ProjectMember,
  UnifiedProjectMember,
  ProjectsQueryParams,
  CreateProjectInput,
  UpdateProjectInput,
};
export { getUnifiedProjectMembers };

export const projectService = {
  async getAllProjects(params?: ProjectsQueryParams): Promise<PaginatedResponse<Project>> {
    const res = await api.get<PaginatedResponse<Project>>("/projects", {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 12,
        searchTerm: params?.searchTerm || undefined,
        type: params?.type !== "all" ? params?.type : undefined,
      },
    });
    return res.data;
  },

  async getProjects(params?: ProjectsQueryParams): Promise<PaginatedResponse<Project>> {
    return this.getAllProjects(params);
  },

  async getProjectById(id: string): Promise<ApiResponse<Project>> {
    const res = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return res.data;
  },

  async createProject(data: CreateProjectInput): Promise<ApiResponse<Project>> {
    const res = await api.post<ApiResponse<Project>>("/projects", data);
    return res.data;
  },

  async updateProject(id: string, data: UpdateProjectInput): Promise<ApiResponse<Project>> {
    const res = await api.patch<ApiResponse<Project>>(`/projects/${id}`, data);
    return res.data;
  },

  async deleteProject(id: string): Promise<ApiResponse<{ message: string }>> {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/projects/${id}`);
    return res.data;
  },

  async addMember(projectId: string, userId: string): Promise<ApiResponse<ProjectMember>> {
    const res = await api.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, { userId });
    return res.data;
  },

  async removeMember(projectId: string, memberId: string): Promise<ApiResponse<{ message: string }>> {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/projects/${projectId}/members/${memberId}`);
    return res.data;
  },

  async searchUsers(searchTerm: string = ""): Promise<ProjectUser[]> {
    try {
      const res = await api.get<PaginatedResponse<ProjectUser>>("/users", {
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
