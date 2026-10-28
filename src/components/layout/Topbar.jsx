
import { Bell, Menu, Search } from "lucide-react";

export default function Topbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-2 text-xs sm:flex">
          <span className="text-slate-400">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-700">Overview</span>
        </div>

        <span className="text-sm font-semibold text-slate-700 sm:hidden">
          NurseFlow
        </span>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <label className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-400 lg:flex">
          <Search size={17} />
          <input
            className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
            placeholder="Search workspace..."
            aria-label="Search workspace"
          />
        </label>

        <button
          className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-white" />
        </button>

        <div className="grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-800 ring-1 ring-teal-100">
          NF
        </div>
      </div>
    </header>
  );
}
