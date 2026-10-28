
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  HeartPulse,
  LayoutDashboard,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import api from "../services/api";

function extractArray(body, keys = []) {
  const candidates = [body, body?.data, body?.results, body?.data?.data];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;

    if (candidate && typeof candidate === "object") {
      for (const key of keys) {
        if (Array.isArray(candidate[key])) return candidate[key];
      }
    }
  }

  return [];
}

function extractCount(body, keys = []) {
  const candidates = [body, body?.data, body?.data?.data];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;

    for (const key of keys) {
      if (typeof candidate[key] === "number") {
        return candidate[key];
      }
    }
  }

  return null;
}

function getPatientName(encounter) {
  const patient = encounter?.patientId;

  if (patient && typeof patient === "object") {
    return (
      patient.fullName ||
      patient.name ||
      patient.patientNumber ||
      "Patient"
    );
  }

  return encounter?.patientName || "Patient";
}

function formatDate(value) {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not recorded";

  return date.toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";

  return "Good evening";
}

function getInitials(user) {
  const name =
    user?.fullName ||
    user?.name ||
    user?.userName ||
    user?.staffId ||
    "Nurse";

  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function getDisplayName(user) {
  return (
    user?.fullName ||
    user?.name ||
    user?.userName ||
    user?.staffId ||
    "Nurse"
  );
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconClass,
  loading,
  onClick,
}) {
  const content = (
    <div className="flex h-full flex-col justify-between gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="mt-3 flex items-center gap-2">
            {loading ? (
              <LoaderCircle className="h-7 w-7 animate-spin text-teal-600" />
            ) : (
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {value}
              </span>
            )}
          </div>
        </div>

        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs leading-5 text-slate-500">{description}</p>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
      </div>
    </div>
  );

  if (!onClick) return content;

  return (
    <Link to={onClick} className="block h-full">
      {content}
    </Link>
  );
}

function QuickAction({ to, icon: Icon, title, description, colorClass }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md sm:p-5"
    >
      <div className={`shrink-0 rounded-xl p-3 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-slate-800 transition group-hover:text-teal-700">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          {description}
        </p>
      </div>

      <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-teal-600" />
    </Link>
  );
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    patients: 0,
    encounters: 0,
    nursingRecords: 0,
    pendingHandovers: 0,
  });
  const [recentEncounters, setRecentEncounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const storedUser = localStorage.getItem("userInfo");

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setUser(parsed?.user || parsed?.data?.user || parsed);
        } catch {
          setUser(null);
        }
      }

      const results = await Promise.allSettled([
        api.get("/patients", { params: { limit: 100 } }),
        api.get("/encounters", {
          params: { status: "active", limit: 100 },
        }),
        api.get("/nursing-records", { params: { limit: 100 } }),
        api.get("/handovers", { params: { status: "submitted", limit: 100 } }),
      ]);

      const [patientsResult, encountersResult, recordsResult, handoversResult] =
        results;

      const patientsBody =
        patientsResult.status === "fulfilled"
          ? patientsResult.value.data
          : null;

      const encountersBody =
        encountersResult.status === "fulfilled"
          ? encountersResult.value.data
          : null;

      const recordsBody =
        recordsResult.status === "fulfilled"
          ? recordsResult.value.data
          : null;

      const handoversBody =
        handoversResult.status === "fulfilled"
          ? handoversResult.value.data
          : null;

      const patients = extractArray(patientsBody, ["patients", "results"]);
      const encounters = extractArray(encountersBody, [
        "encounters",
        "results",
      ]);
      const records = extractArray(recordsBody, [
        "nursingRecords",
        "records",
        "results",
      ]);
      const handovers = extractArray(handoversBody, [
        "handovers",
        "results",
      ]);

      const patientCount =
        extractCount(patientsBody, ["total", "totalCount", "totalPatients"]) ??
        patients.length;

      const encounterCount =
        extractCount(encountersBody, [
          "total",
          "totalCount",
          "totalEncounters",
        ]) ?? encounters.length;

      const recordCount =
        extractCount(recordsBody, [
          "total",
          "totalCount",
          "totalRecords",
        ]) ?? records.length;

      setStats({
        patients: patientCount,
        encounters: encounterCount,
        nursingRecords: recordCount,
        pendingHandovers: handovers.length,
      });

      setRecentEncounters(
        encounters
          .slice()
          .sort((a, b) => {
            const aDate = new Date(
              a.updatedAt || a.admittedAt || a.createdAt || 0
            ).getTime();

            const bDate = new Date(
              b.updatedAt || b.admittedAt || b.createdAt || 0
            ).getTime();

            return bDate - aDate;
          })
          .slice(0, 5)
      );

      const failedRequests = results.filter(
        (result) => result.status === "rejected"
      );

      if (failedRequests.length === results.length) {
        setError(
          "Unable to load dashboard data. Check your backend connection and login session."
        );
      } else if (failedRequests.length > 0) {
        setError(
          "Some dashboard information could not be loaded. Check the affected backend endpoints."
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load dashboard information."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const displayName = getDisplayName(user);
  const initials = getInitials(user);

  return (
    <div className="min-h-full space-y-7 pb-8">
      <PageHeader
        eyebrow="Nurse workspace"
        title="Dashboard"
        description="Your overview of patients, active encounters, nursing documentation, and shift handovers."
        action={
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing || loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        }
      />

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-600 to-blue-700 p-5 text-white shadow-lg sm:p-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[36px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-cyan-300/10 blur-2xl" />

        <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-teal-100">
              <Activity className="h-4 w-4" />
              {getGreeting()}
            </div>

            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {displayName}
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-teal-50 sm:text-base">
              Keep patient documentation organized, review doctor-advised
              orders, and prepare clear handovers for the next nursing shift.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/patients"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-teal-800 transition hover:bg-teal-50"
              >
                <Users className="h-4 w-4" />
                View patients
              </Link>

              <Link
                to="/handovers"
                className="inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <ClipboardList className="h-4 w-4" />
                Shift handovers
              </Link>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm sm:min-w-52">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-lg font-bold text-teal-700">
              {initials}
            </div>
            <div>
              <p className="font-semibold">{displayName}</p>
              <p className="mt-1 text-xs capitalize text-teal-100">
                {String(user?.role || "nurse").replaceAll("_", " ")}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Authenticated workspace
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            className="shrink-0 font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Nursing overview
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Current data from your connected modules
            </p>
          </div>

          <span className="hidden items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700 sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
            Live API data
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Patients"
            value={stats.patients}
            description="Patient records"
            icon={Users}
            iconClass="bg-blue-50 text-blue-700"
            loading={loading}
            onClick="/patients"
          />

          <StatCard
            title="Active encounters"
            value={stats.encounters}
            description="Current episodes of care"
            icon={HeartPulse}
            iconClass="bg-teal-50 text-teal-700"
            loading={loading}
            onClick="/patients"
          />

          <StatCard
            title="Nursing records"
            value={stats.nursingRecords}
            description="Available nursing documentation"
            icon={FilePlus2}
            iconClass="bg-violet-50 text-violet-700"
            loading={loading}
            onClick="/nursing-records"
          />

          <StatCard
            title="Pending handovers"
            value={stats.pendingHandovers}
            description="Submitted handovers awaiting acknowledgement"
            icon={CalendarClock}
            iconClass="bg-amber-50 text-amber-700"
            loading={loading}
            onClick="/handovers"
          />
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-900">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Go directly to your everyday nursing tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          <QuickAction
            to="/patients"
            icon={Users}
            title="Patient records"
            description="Find patients and open their active encounters."
            colorClass="bg-blue-50 text-blue-700"
          />

          <QuickAction
            to="/nursing-records"
            icon={Activity}
            title="Record observations"
            description="Document vital signs and nursing progress."
            colorClass="bg-teal-50 text-teal-700"
          />

          <QuickAction
            to="/care-plans"
            icon={ClipboardList}
            title="Nursing care plans"
            description="Review problems, goals, and interventions."
            colorClass="bg-violet-50 text-violet-700"
          />

          <QuickAction
            to="/doctor-orders"
            icon={Stethoscope}
            title="Record doctor's order"
            description="Enter doctor-advised instructions with proper attribution."
            colorClass="bg-amber-50 text-amber-700"
          />

          <QuickAction
            to="/handovers"
            icon={CalendarClock}
            title="Shift handover"
            description="Prepare and review shift updates and pending tasks."
            colorClass="bg-cyan-50 text-cyan-700"
          />

          <QuickAction
            to="/patients"
            icon={LayoutDashboard}
            title="Continue patient care"
            description="Return to patient records and select an encounter."
            colorClass="bg-emerald-50 text-emerald-700"
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white xl:col-span-3">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-900">
                Active patient encounters
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Recently updated encounters
              </p>
            </div>

            <Link
              to="/patients"
              className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 hover:text-teal-800"
            >
              View patients
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-2 px-5 py-12 text-sm text-slate-500">
              <LoaderCircle className="h-5 w-5 animate-spin text-teal-600" />
              Loading encounters...
            </div>
          ) : recentEncounters.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Users className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 font-medium text-slate-700">
                No active encounters found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Active patient encounters will appear here when available.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentEncounters.map((encounter) => (
                <div
                  key={encounter._id}
                  className="flex items-center gap-3 px-5 py-4 transition hover:bg-slate-50 sm:px-6"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                    <HeartPulse className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {getPatientName(encounter)}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      Encounter:{" "}
                      {encounter.encounterNumber ||
                        encounter._id ||
                        "Not available"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Updated:{" "}
                      {formatDate(
                        encounter.updatedAt ||
                          encounter.admittedAt ||
                          encounter.createdAt
                      )}
                    </p>
                  </div>

                  <div className="hidden shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 sm:inline-flex">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Active
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-teal-50 p-3 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Workflow reminders</h2>
              <p className="mt-1 text-xs text-slate-500">
                Helpful checks for your shift
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Keep records up to date
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Record observations and nursing interventions against the
                  correct patient encounter.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Bell className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Review doctor-advised orders
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Enter the doctor's instruction accurately and retain the
                  doctor's identity and verification status.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Prepare a clear handover
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Review pending care and relevant safety concerns before
                  submitting a handover.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ArrowDownRight className="mt-0.5 h-5 w-5 shrink-0 text-violet-600" />
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Verify before completing
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Confirm entries are accurate and flag missing information
                  rather than assuming it is normal.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/handovers"
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            Open shift handovers
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <p className="text-center text-xs leading-5 text-slate-400">
        NurseFlow hackathon prototype · Use synthetic patient data for
        demonstrations. This dashboard is not a substitute for clinical
        judgment or validated hospital systems.
      </p>
    </div>
  );
}
