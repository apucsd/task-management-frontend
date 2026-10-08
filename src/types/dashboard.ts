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
