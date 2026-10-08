import { FiFolder, FiCheckCircle, FiClock, FiFlag } from "react-icons/fi";
import { StatsCard } from "./StatCard";

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatsCard
        title="Total Projects"
        value={8}
        icon={FiFolder}
        iconBg="bg-blue-50"
        iconColor="text-blue-600"
        hasArrow
      />
      <StatsCard
        title="Total Tasks"
        value={24}
        icon={FiCheckCircle}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <StatsCard
        title="In Progress"
        value={12}
        icon={FiClock}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
      />
      <StatsCard
        title="Overdue"
        value={6}
        icon={FiFlag}
        iconBg="bg-rose-50"
        iconColor="text-rose-600"
      />
    </div>
  );
}
