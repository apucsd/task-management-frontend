"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiHome,
  FiFolder,
  FiCheckSquare,
  FiCalendar,
  FiUsers,
  FiSettings,
  FiChevronRight,
  FiGrid,
} from "react-icons/fi";

const navItems = [
  { label: "Dashboard", icon: FiHome, href: "/" },
  { label: "Projects", icon: FiFolder, href: "/projects" },
  { label: "Tasks", icon: FiCheckSquare, href: "/tasks" },
  { label: "Calendar", icon: FiCalendar, href: "/calendar" },
  { label: "Team", icon: FiUsers, href: "/team" },
  { label: "Settings", icon: FiSettings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-slate-100 bg-white min-h-screen flex flex-col justify-between p-4">
      <div>
        {/* BRAND LOGO */}
        <div className="flex items-center gap-2.5 px-3 py-4 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white">
            <FiGrid size={18} strokeWidth={2} />
          </div>
          <span className="font-bold text-lg text-slate-900 tracking-tight">
            TaskFlow
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                }`}
              >
                <Icon size={18} strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* USER CARD */}
      <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
            JD
          </div>
          <div className="text-left">
            <p className="text-xs font-semibold text-slate-800 leading-none">
              John Doe
            </p>
            <p className="text-[11px] text-slate-400 mt-1 leading-none">
              john@example.com
            </p>
          </div>
        </div>
        <FiChevronRight className="text-slate-400" size={16} />
      </div>
    </aside>
  );
}
