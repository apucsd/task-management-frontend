import { api, ApiResponse } from "@/lib/api";
import type { DashboardOverview } from "@/types/dashboard";

// Re-export type for backwards compatibility
export type { DashboardOverview };

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const res = await api.get<ApiResponse<DashboardOverview>>("/dashboard/overview");
    return (
      res.data?.data || {
        projects: { total: 0, active: 0 },
        tasks: { total: 0, completed: 0, inProgress: 0, todo: 0, highPriority: 0 },
      }
    );
  },
};
