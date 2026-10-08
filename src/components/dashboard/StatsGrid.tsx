"use client";

import { useEffect, useState } from "react";
import {
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import { StatsCard } from "./StatCard";
import { dashboardService, DashboardOverview } from "@/lib/services/dashboardService";

export function StatsGrid() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService
      .getOverview()
      .then((overview) => {
        setData(overview);
      })
      .catch((err) => {
        console.error("Failed to load dashboard overview:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-white border border-slate-100 rounded-2xl shadow-xs animate-pulse flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100" />
              <div className="space-y-2">
                <div className="w-10 h-6 bg-slate-100 rounded" />
                <div className="w-20 h-3 bg-slate-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const projects = data?.projects || { total: 0, active: 0 };
  const tasks = data?.tasks || {
    total: 0,
    completed: 0,
    inProgress: 0,
    todo: 0,
    highPriority: 0,
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Projects"
        value={projects.total}
        subtitle={`${projects.active} active workspace${projects.active === 1 ? "" : "s"}`}
        icon={FiFolder}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        href="/projects"
        hasArrow
      />
      <StatsCard
        title="In Progress"
        value={tasks.inProgress}
        subtitle={`${tasks.todo} task${tasks.todo === 1 ? "" : "s"} to do`}
        icon={FiClock}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
      <StatsCard
        title="Completed"
        value={tasks.completed}
        subtitle={`${tasks.total} total task${tasks.total === 1 ? "" : "s"}`}
        icon={FiCheckCircle}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <StatsCard
        title="High Priority"
        value={tasks.highPriority}
        subtitle="Requires immediate focus"
        icon={FiAlertTriangle}
        iconBg="bg-rose-50"
        iconColor="text-rose-600"
      />
    </div>
  );
}
