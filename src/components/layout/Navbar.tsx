"use client";

import { useAuth } from "@/context/AuthContext";
import { useMobileNav } from "@/context/MobileNavContext";
import { FiSearch, FiBell, FiLogOut, FiMenu } from "react-icons/fi";

export function Navbar() {
  const { user, logout } = useAuth();
  const { toggle } = useMobileNav();

  const displayName = user?.name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <header className="h-16 border-b border-slate-100 bg-white/70 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* LEFT: HAMBURGER (mobile) & SEARCH */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="p-2 -ml-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl md:hidden transition cursor-pointer"
          aria-label="Toggle Navigation Menu"
        >
          <FiMenu size={20} />
        </button>

        {/* SEARCH INPUT - hidden on very small phones, expanded on tablet & laptop */}
        <div className="relative hidden sm:block w-48 md:w-64 lg:w-80">
          <FiSearch
            className="absolute left-3.5 top-3 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search projects, tasks..."
            className="w-full pl-9 pr-12 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
          <kbd className="absolute right-3 top-2.5 text-[10px] bg-slate-200/60 text-slate-500 font-medium px-1.5 py-0.5 rounded">
            ⌘ K
          </kbd>
        </div>
      </div>

      {/* RIGHT ICONS & USER */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition">
          <FiBell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2.5">
          {user?.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
              {initials}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline-block">
            {displayName}
          </span>
          <button
            onClick={logout}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition ml-1"
          >
            <FiLogOut size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
