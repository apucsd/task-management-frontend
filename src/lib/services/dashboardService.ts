import { api } from "@/lib/api";

export interface DashboardOverview {
  projects: {
    total: number;
    active: number;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    todo: number;
    highPriority: number;
  };
}

export interface DashboardOverviewResponse {
  success: boolean;
  message: string;
  data: DashboardOverview;
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    const res = await api.get<DashboardOverviewResponse>("/dashboard/overview");
    return (
      res.data?.data || {
        projects: { total: 0, active: 0 },
        tasks: { total: 0, completed: 0, inProgress: 0, todo: 0, highPriority: 0 },
      }
    );
  },
};
