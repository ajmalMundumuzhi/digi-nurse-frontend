
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ClipboardList, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import CarePlanForm from "../components/care-plans/CarePlanForm";
import CarePlanList from "../components/care-plans/CarePlanList";
import CarePlanDetails from "../components/care-plans/CarePlanDetail";
import { getActiveEncounters } from "../services/nursingRecordService";
import { createCarePlan, getCarePlans } from "../services/carePlanService";

const statusOptions = [
  { value: "", label: "All statuses" },
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "discontinued", label: "Discontinued" }
];

const inputClass = "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

export default function CarePlansPage() {
  const [encounters, setEncounters] = useState([]);
  const [encounterId, setEncounterId] = useState("");
  const [plans, setPlans] = useState([]);
  const [status, setStatus] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingEncounters, setLoadingEncounters] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadEncounters() {
      setLoadingEncounters(true);
      setError("");

      try {
        const result = await getActiveEncounters();

        if (!active) return;

        setEncounters(result);
        setEncounterId((current) => (
          current && result.some((item) => item._id === current)
            ? current
            : result[0]?._id || ""
        ));
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            "Could not load active encounters. Check your login and backend connection."
          );
        }
      } finally {
        if (active) setLoadingEncounters(false);
      }
    }

    loadEncounters();

    return () => {
      active = false;
    };
  }, []);

  const loadPlans = useCallback(async () => {
    if (!encounterId) {
      setPlans([]);
      setLoadingPlans(false);
      return;
    }

    setLoadingPlans(true);
    setError("");

    try {
      const result = await getCarePlans({
        encounterId,
        status,
        limit: 100
      });

      setPlans(result.plans);
    } catch (requestError) {
      setPlans([]);
      setError(
        requestError.response?.data?.message ||
        "Could not load care plans. Verify the care-plan API route and permissions."
      );
    } finally {
      setLoadingPlans(false);
    }
  }, [encounterId, status, reloadKey]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleCreate = async (payload) => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createCarePlan(payload);
      setShowForm(false);
      setNotice("Draft care plan created successfully.");
      await loadPlans();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Could not create the care plan. Check the backend validation requirements."
      );
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="PLANNED CARE"
        title="Nursing care plans"
        description="Review care problems, goals, interventions, and evaluations linked to patient encounters."
        action={
          <button
            onClick={() => {
              setError("");
              setNotice("");
              setShowForm(true);
            }}
            disabled={!encounters.length || loadingEncounters}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
            New care plan
          </button>
        }
      />

      {notice && (
        <div role="status" className="mb-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-red-800">Care plans request failed</p>
            <p className="mt-1 break-words text-xs leading-5 text-red-700">{error}</p>
          </div>
          <button
            onClick={() => setReloadKey((value) => value + 1)}
            className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
          >
            Retry
          </button>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <Field label="Active encounter">
            <select
              value={encounterId}
              onChange={(event) => setEncounterId(event.target.value)}
              disabled={loadingEncounters || !encounters.length}
              className={inputClass}
            >
              <option value="">
                {loadingEncounters ? "Loading encounters..." : "Choose an encounter"}
              </option>
              {encounters.map((encounter) => (
                <option key={encounter._id} value={encounter._id}>
                  {encounter.encounterNumber || encounter.encounterId || encounter._id}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Plan status">
            <select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </Field>

          <div className="flex items-center gap-3 sm:col-span-2">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <ClipboardList size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-800">Care plan directory</h3>
              <p className="mt-1 text-xs text-slate-500">
                {loadingPlans ? "Loading care plans..." : `${plans.length} plan${plans.length === 1 ? "" : "s"} shown`}
              </p>
            </div>
            <button
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loadingPlans || !encounterId}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingPlans ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100">
          {loadingEncounters || loadingPlans ? (
            <div className="flex min-h-56 flex-col items-center justify-center gap-3">
              <LoaderCircle size={27} className="animate-spin text-teal-700" />
              <p className="text-sm text-slate-500">Loading care plans...</p>
            </div>
          ) : !encounters.length ? (
            <EmptyState message="No active encounters are available for this account." />
          ) : !error ? (
            <CarePlanList plans={plans} onView={setSelectedPlan} />
          ) : (
            <EmptyState message="Care plans are unavailable. Retry the request to continue." />
          )}
        </div>
      </section>

      {showForm && (
        <CarePlanForm
          encounters={encounters}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {selectedPlan && (
        <CarePlanDetails
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-5 text-center">
      <AlertCircle size={24} className="text-amber-600" />
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">{message}</p>
    </div>
  );
}
