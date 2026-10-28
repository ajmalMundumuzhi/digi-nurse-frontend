
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, FileText, LoaderCircle, Plus, RefreshCw } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import NursingRecordForm from "../components/nursing-record/NursingRecordForm";
import NursingRecordList from "../components/nursing-record/NursingRecordList";
import NursingRecordDetails from "../components/nursing-record/NursingRecordDetails";
import {
  createNursingRecord,
  getActiveEncounters,
  getNursingRecords
} from "../services/nursingRecordService";

function getEncounterId(encounter) {
  return encounter._id;
}

function getEncounterLabel(encounter) {
  const patient = encounter.patientId;
  const patientName = patient && typeof patient === "object"
    ? [patient.firstName, patient.lastName].filter(Boolean).join(" ")
    : "";

  const identifier = encounter.encounterNumber || encounter.encounterId || encounter._id;

  return patientName ? `${identifier} · ${patientName}` : identifier;
}

export default function NursingRecordsPage() {
  const [encounters, setEncounters] = useState([]);
  const [encounterId, setEncounterId] = useState("");
  const [records, setRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingEncounters, setLoadingEncounters] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
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

        setEncounterId((current) => {
          if (current && result.some((item) => getEncounterId(item) === current)) {
            return current;
          }

          return result[0]?._id || "";
        });
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            "Could not load active encounters. Check your backend connection and permissions."
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

  const loadRecords = useCallback(async () => {
    if (!encounterId) {
      setRecords([]);
      return;
    }

    setLoadingRecords(true);
    setError("");

    try {
      const result = await getNursingRecords(encounterId);
      setRecords(result);
    } catch (requestError) {
      setRecords([]);
      setError(
        requestError.response?.data?.message ||
        "Could not load nursing records for this encounter."
      );
    } finally {
      setLoadingRecords(false);
    }
  }, [encounterId, reloadKey]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleCreate = async (payload) => {
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createNursingRecord(payload);
      setShowForm(false);
      setNotice("Nursing record created successfully.");
      await loadRecords();
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
        "Unable to create the nursing record. Check the required fields and try again."
      );
      throw requestError;
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="CLINICAL DOCUMENTATION"
        title="Nursing records"
        description="Review and create documentation linked to an active patient encounter."
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
            New record
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
            <p className="text-sm font-semibold text-red-800">Nursing records request failed</p>
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
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div className="min-w-0 flex-1">
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Active encounter
            </label>

            <select
              value={encounterId}
              onChange={(event) => {
                setEncounterId(event.target.value);
                setNotice("");
              }}
              disabled={loadingEncounters || !encounters.length}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 sm:max-w-xl"
            >
              <option value="">
                {loadingEncounters ? "Loading encounters..." : "Choose an active encounter"}
              </option>
              {encounters.map((encounter) => (
                <option key={encounter._id} value={getEncounterId(encounter)}>
                  {getEncounterLabel(encounter)}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setReloadKey((value) => value + 1)}
            disabled={loadingRecords || !encounterId}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={15} className={loadingRecords ? "animate-spin" : ""} />
            Refresh records
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 border-y border-slate-100 bg-slate-50/70 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-teal-700">
              <FileText size={17} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Documentation history</h3>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {loadingRecords ? "Loading..." : `${records.length} record${records.length === 1 ? "" : "s"} in this result`}
              </p>
            </div>
          </div>
        </div>

        {loadingEncounters ? (
          <LoadingState message="Loading active encounters..." />
        ) : !encounters.length ? (
          <EmptyState
            title="No active encounters found"
            description="An active encounter is required before you can create a nursing record."
          />
        ) : loadingRecords ? (
          <LoadingState message="Loading nursing records..." />
        ) : !error ? (
          <NursingRecordList
            records={records}
            onViewRecord={setSelectedRecord}
          />
        ) : (
          <EmptyState
            title="Records are unavailable"
            description="Use Retry to request the records again."
          />
        )}
      </section>

      {showForm && (
        <NursingRecordForm
          encounters={encounters}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          saving={saving}
        />
      )}

      {selectedRecord && (
        <NursingRecordDetails
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </>
  );
}

function LoadingState({ message }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3">
      <LoaderCircle size={27} className="animate-spin text-teal-700" />
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-5 py-10 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-50 text-amber-700">
        <AlertCircle size={23} />
      </div>
      <h3 className="mt-4 text-sm font-bold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">{description}</p>
    </div>
  );
}