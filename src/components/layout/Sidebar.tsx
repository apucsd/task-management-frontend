"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  FiHome,
  FiFolder,
  FiCheckSquare,
  FiGrid,
  FiLogOut,
} from "react-icons/fi";

const navItems = [
  { label: "Dashboard", icon: FiHome, href: "/" },
  { label: "Projects", icon: FiFolder, href: "/projects" },
  { label: "Tasks", icon: FiCheckSquare, href: "/tasks" },
];

function SidebarContent() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

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

      {/* USER CARD & LOGOUT */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between p-2.5 rounded-2xl border border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 min-w-0">
            {user?.image ? (
              <img
                src={user.image}
                alt={displayName}
                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                {initials}
              </div>
            )}
            <div className="text-left min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                {displayName}
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                {displayEmail}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside className="w-64 border-r border-slate-100 bg-white min-h-screen p-4 hidden md:block" />
      }
    >
      <SidebarContent />
    </Suspense>
  );
}
