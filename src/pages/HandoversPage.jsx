
import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/common/PageHeader";
import HandoverForm from "../components/handovers/handoverForm";
import HandoverList from "../components/handovers/HandoversList";
import HandoverDetails from "../components/handovers/HandoverDetails";
import {
  acknowledgeHandover,
  createHandover,
  getActiveEncounters,
  getHandovers,
  submitHandover,
} from "../services/handoversService";
import { getCurrentUser } from "../services/doctorOrderService";

const statusOptions = [
  { label: "All handovers", value: "" },
  { label: "Draft", value: "draft" },
  { label: "Submitted", value: "submitted" },
  { label: "Acknowledged", value: "acknowledged" },
  { label: "Amended", value: "amended" },
];

export default function HandoversPage() {
  const [handovers, setHandovers] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [handoverResult, encounterResult, currentUser] = await Promise.all([
        getHandovers({ status }),
        getActiveEncounters(),
        getCurrentUser(),
      ]);

      setHandovers(handoverResult.handovers);
      setEncounters(encounterResult);

      const user = currentUser?.user || currentUser?.data?.user || currentUser;
      setRole(user?.role || user?.user?.role || "");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to load handovers. Check your backend connection and API routes."
      );
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function handleCreate(payload) {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createHandover(payload);
      setShowForm(false);
      setNotice("Handover created successfully.");
      await loadPage();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to create the handover."
      );
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(handover) {
    const confirmed = window.confirm(
      "Submit this handover for the incoming nurse?"
    );

    if (!confirmed) return;

    setBusyId(handover._id);
    setError("");
    setNotice("");

    try {
      await submitHandover(handover._id);
      setNotice("Handover submitted successfully.");
      setSelectedHandover(null);
      await loadPage();
    } catch (err) {
      setError(
        err?.response?.data?.message || "Unable to submit the handover."
      );
    } finally {
      setBusyId("");
    }
  }

  async function handleAcknowledge(handover) {
    const confirmed = window.confirm(
      "Confirm that you have received and reviewed this handover?"
    );

    if (!confirmed) return;

    setBusyId(handover._id);
    setError("");
    setNotice("");

    try {
      await acknowledgeHandover(handover._id);
      setNotice("Handover acknowledged successfully.");
      setSelectedHandover(null);
      await loadPage();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Unable to acknowledge this handover. Confirm that you are the designated incoming nurse."
      );
    } finally {
      setBusyId("");
    }
  }

  const canAcknowledge =
    ["nurse", "nurse_in_charge"].includes(role) &&
    selectedHandover?.status === "submitted";

  return (
    <div className="min-h-full space-y-6">
      <PageHeader
        eyebrow="Nursing workflow"
        title="Shift Handovers"
        description="Record shift updates, pending care, doctor orders, and safety concerns for the incoming team."
        action={
          <button
            type="button"
            onClick={() => {
              setNotice("");
              setError("");
              setShowForm((current) => !current);
            }}
            className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            {showForm ? "Close form" : "New handover"}
          </button>
        }
      />

      {notice && (
        <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {error && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button type="button" onClick={loadPage} className="shrink-0 font-semibold underline">
            Retry
          </button>
        </div>
      )}

      {showForm && (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-900">Create a handover</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review the details carefully before creating the record.
            </p>
          </div>
          <HandoverForm
            encounters={encounters}
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            saving={saving}
          />
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Handover records</h2>
            <p className="mt-1 text-sm text-slate-500">
              Review previous handovers and complete any pending workflow actions.
            </p>
          </div>

          <label className="w-full sm:w-52">
            <span className="sr-only">Filter by status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
            <p className="mt-3 text-sm text-slate-500">Loading handovers...</p>
          </div>
        ) : (
          <HandoverList
            handovers={handovers}
            role={role}
            onView={setSelectedHandover}
            onSubmit={handleSubmit}
            onAcknowledge={handleAcknowledge}
            busyId={busyId}
          />
        )}
      </section>

      <HandoverDetails
        handover={selectedHandover}
        onClose={() => setSelectedHandover(null)}
        onAcknowledge={handleAcknowledge}
        canAcknowledge={canAcknowledge}
        busy={busyId === selectedHandover?._id}
      />
    </div>
  );
}
