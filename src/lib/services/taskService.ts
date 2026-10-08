import { api, ApiResponse, PaginatedResponse } from "@/lib/api";
import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskUser,
  TaskProject,
  TaskQueryParams,
  CreateTaskInput,
  UpdateTaskInput,
} from "@/types/task";

// Re-export types for 100% backwards compatibility
export type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskUser,
  TaskProject,
  TaskQueryParams,
  CreateTaskInput,
  UpdateTaskInput,
};

export const taskService = {
  async getTasks(params?: TaskQueryParams): Promise<PaginatedResponse<Task>> {
    const res = await api.get<PaginatedResponse<Task>>("/tasks", { params });
    return res.data;
  },

  async getTaskById(id: string): Promise<ApiResponse<Task>> {
    const res = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
    return res.data;
  },

  async createTask(data: CreateTaskInput): Promise<ApiResponse<Task>> {
    const res = await api.post<ApiResponse<Task>>("/tasks", data);
    return res.data;
  },

  async updateTask(id: string, data: UpdateTaskInput): Promise<ApiResponse<Task>> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, data);
    return res.data;
  },

  async updateTaskStatus(id: string, status: TaskStatus): Promise<ApiResponse<Task>> {
    const res = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, { status });
    return res.data;
  },

  async deleteTask(id: string): Promise<ApiResponse<{ message: string }>> {
    const res = await api.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
    return res.data;
  },
};
