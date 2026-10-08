import Link from "next/link";
import { FiPlus } from "react-icons/fi";

export function DashboardHeader({
  name = "John",
  onNewProject,
}: {
  name?: string;
  onNewProject?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Good morning, {name}!
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium">
          Here's what's happening with your projects today.
        </p>
      </div>
      {onNewProject ? (
        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
        >
          <FiPlus size={16} strokeWidth={2} />
          New Project
        </button>
      ) : (
        <Link
          href="/projects"
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
        >
          <FiPlus size={16} strokeWidth={2} />
          New Project
        </Link>
      )}
    </div>
  );
}
