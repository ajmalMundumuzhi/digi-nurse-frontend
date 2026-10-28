
import {
  Activity,
  ArrowRight,
  ClipboardList,
  Clock3,
  FileText,
  Plus,
  Stethoscope,
  Users
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";

const tasks = [
  {
    title: "Review nursing documentation",
    detail: "Nursing records workflow",
    status: "In progress",
    color: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700"
  },
  {
    title: "Prepare shift handover",
    detail: "Shift coordination workflow",
    status: "Pending",
    color: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700"
  },
  {
    title: "Review care plan goals",
    detail: "Care planning workflow",
    status: "Pending",
    color: "bg-teal-600",
    badge: "bg-teal-50 text-teal-700"
  }
];

const shortcuts = [
  { label: "Patient directory", path: "/patients", icon: Users },
  { label: "Nursing records", path: "/nursing-records", icon: FileText },
  { label: "Doctor orders", path: "/doctor-orders", icon: Stethoscope },
  { label: "Shift handovers", path: "/handovers", icon: Activity }
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        eyebrow="WORKSPACE OVERVIEW"
        title="Good day, care team"
        description="An overview of your nursing workflow and daily priorities."
        action={
          <Link
            to="/patients"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
          >
            <Plus size={17} />
            View patients
          </Link>
        }
      />

      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-800 via-teal-700 to-blue-700 p-5 text-white sm:p-7">
        <div className="pointer-events-none absolute -right-10 -top-20 h-60 w-60 rounded-full border border-white/10 shadow-[0_0_0_35px_rgba(255,255,255,0.04),0_0_0_70px_rgba(255,255,255,0.03)]" />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10">
            <Activity size={28} />
          </div>

          <div className="max-w-2xl">
            <p className="mb-2 text-[10px] font-bold tracking-[0.18em] text-teal-100">
              NURSEFLOW CLINICAL WORKSPACE
            </p>

            <h3 className="text-xl font-bold tracking-tight sm:text-2xl">
              Care coordination, in one place.
            </h3>

            <p className="mt-2 text-sm leading-6 text-teal-50">
              Manage patient encounters, nursing records, doctor orders,
              care plans, and shift handovers from a unified workspace.
            </p>
          </div>

          <div className="sm:ml-auto sm:shrink-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-300" />
              Prototype environment
            </span>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Workspace overview
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Live counts will appear after backend integration.
            </p>
          </div>

          <span className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-500">
            Demo preview
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Patients"
            value="—"
            note="Patient API not connected"
            icon={Users}
            tone="teal"
          />
          <StatCard
            label="Nursing records"
            value="—"
            note="Records API not connected"
            icon={FileText}
            tone="blue"
          />
          <StatCard
            label="Care plans"
            value="—"
            note="Care plan API not connected"
            icon={ClipboardList}
            tone="violet"
          />
          <StatCard
            label="Pending handovers"
            value="—"
            note="Handover API not connected"
            icon={Clock3}
            tone="amber"
          />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.25fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800">Workflow checklist</h3>
              <p className="mt-1 text-xs text-slate-500">
                Example tasks for the prototype
              </p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-xs font-bold text-teal-800">
              03
            </span>
          </div>

          <div className="mt-4">
            {tasks.map((task) => (
              <div
                key={task.title}
                className="flex min-h-[68px] items-center gap-3 border-t border-slate-100 py-3"
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${task.color}`} />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {task.title}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">{task.detail}</p>
                </div>

                <span className={`shrink-0 rounded-lg px-2 py-1.5 text-[10px] font-medium ${task.badge}`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
          <div>
            <h3 className="font-bold text-slate-800">Quick access</h3>
            <p className="mt-1 text-xs text-slate-500">
              Navigate to a workspace
            </p>
          </div>

          <div className="mt-4">
            {shortcuts.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className="group flex min-h-[54px] items-center gap-3 border-t border-slate-100 py-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:bg-teal-700 group-hover:text-white">
                  <Icon size={18} />
                </span>

                <span className="flex-1 text-sm font-medium text-slate-600 group-hover:text-teal-800">
                  {label}
                </span>

                <ArrowRight size={16} className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-700" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
