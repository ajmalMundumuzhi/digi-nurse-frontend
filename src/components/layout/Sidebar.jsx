
import { NavLink } from "react-router-dom";
import {
  Activity,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Stethoscope,
  Users,
  X
} from "lucide-react";

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Patients", path: "/patients", icon: Users },
  { label: "Nursing Records", path: "/nursing-records", icon: FileText },
  { label: "Doctor Orders", path: "/doctor-orders", icon: Stethoscope },
  { label: "Care Plans", path: "/care-plans", icon: ClipboardList },
  { label: "Shift Handovers", path: "/handovers", icon: Activity }
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
          onClick={onClose}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-9 flex items-center gap-3 px-2">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-teal-700 text-white">
            <Activity size={24} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-800">
              NurseFlow
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Clinical workspace
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.16em] text-slate-400">
          WORKSPACE
        </p>

        <nav className="space-y-1">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                  isActive
                    ? "bg-teal-50 font-semibold text-teal-800"
                    : "text-slate-600 hover:bg-slate-50 hover:text-teal-800"
                }`
              }
            >
              <Icon size={19} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Demo environment
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("nurseflow_token");
              window.location.href = "/login";
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
