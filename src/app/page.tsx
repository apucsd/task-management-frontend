"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-8 max-w-7xl mx-auto w-full space-y-6">
          <DashboardHeader name="John" />
          <StatsGrid />
          {/* PROJECTS & TASKS GRID SECTION */}
        </main>
      </div>
    </div>
  );
}
