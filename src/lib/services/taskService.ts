import api, { ApiResponse, PaginatedResponse } from "@/lib/api";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export interface TaskUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export interface TaskProject {
  id: string;
  name: string;
  ownerId?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
  createdAt: string;
  updatedAt: string;
  project?: TaskProject;
  assignee?: TaskUser | null;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  searchTerm?: string;
  projectId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  projectId: string;
  assigneeId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
}

export const taskService = {
  /**
   * Get paginated tasks with optional filters
   */
  async getTasks(params?: TaskQueryParams): Promise<PaginatedResponse<Task>> {
    const res = await api.get<PaginatedResponse<Task>>("/tasks", { params });
    return res.data;
  },

  /**
   * Get single task by ID
   */
  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskInput): Promise<ApiResponse<Task>> {
    const res = await api.post<ApiResponse<Task>>("/tasks", data);
    return res.data;
  },

  /**
   * Update task by ID
   */
  async updateTask(id: string, data: UpdateTaskInput): Promise<ApiResponse<Task>> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data;
  },

  /**
   * Quick status update
   */
  async updateTaskStatus(id: string, status: TaskStatus): Promise<ApiResponse<Task>> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, { status });
    return res.data;
  },

  /**
   * Delete task (project owner only)
   */
  async deleteTask(id: string): Promise<ApiResponse<{ message: string }>> {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
    return res.data;
  },
};
