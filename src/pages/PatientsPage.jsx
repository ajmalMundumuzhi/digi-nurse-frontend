
import { useCallback, useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, RefreshCw, Users } from "lucide-react";
import PageHeader from "../components/common/PageHeader";
import PatientSearch from "../components/patients/PatientSearch";
import PatientList from "../components/patients/PatientList";
import PatientDetailsModal from "../components/patients/PatientDetailsModal";
import { getPatients } from "../services/patientService";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [patients, setPatients] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getPatients({
        search: debouncedSearch,
        page,
        limit
      });

      setPatients(result.patients);
      setPagination(result.pagination);
    } catch (requestError) {
      setPatients([]);
      setError(
        requestError.response?.data?.message ||
        (requestError.response?.status === 401
          ? "Your session may have expired. Please sign in again."
          : requestError.message === "Network Error"
            ? "Cannot reach the backend. Check that your server is running on port 5000 and that CORS allows this frontend."
            : "Unable to load patients. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, limit, reloadKey]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const total = Number(pagination.total ?? pagination.totalItems ?? patients.length);
  const totalPages = Math.max(
    1,
    Number(pagination.totalPages ?? Math.ceil(total / limit) ?? 1)
  );

  return (
    <>
      <PageHeader
        eyebrow="PATIENT CARE"
        title="Patients"
        description="Search and review patient records in your institution."
        action={
          <div className="inline-flex items-center gap-2 rounded-xl border border-teal-100 bg-teal-50 px-3 py-2.5 text-xs font-semibold text-teal-800">
            <Users size={16} />
            Patient directory
          </div>
        }
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-900/[0.02]">
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-800">Patient directory</h3>
              <p className="mt-1 text-xs text-slate-500">
                {loading ? "Retrieving patient records..." : `${total} patient${total === 1 ? "" : "s"} found`}
              </p>
            </div>

            <button
              onClick={() => setReloadKey((value) => value + 1)}
              disabled={loading}
              className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <PatientSearch
            search={search}
            onSearchChange={setSearch}
            limit={limit}
            onLimitChange={(value) => {
              setLimit(value);
              setPage(1);
            }}
          />
        </div>

        {error && (
          <div className="mx-4 mb-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 sm:mx-5">
            <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-red-800">Patient data could not be loaded</p>
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

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 border-t border-slate-100">
            <LoaderCircle size={28} className="animate-spin text-teal-700" />
            <p className="text-sm text-slate-500">Loading patient records...</p>
          </div>
        ) : !error ? (
          <>
            <div className="border-t border-slate-100">
              <PatientList
                patients={patients}
                onViewPatient={setSelectedPatient}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500">
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="grid h-8 min-w-8 place-items-center rounded-lg bg-teal-700 px-2 text-xs font-bold text-white">
                  {page}
                </span>

                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || loading}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="border-t border-slate-100 py-8 text-center text-xs text-slate-500">
            Check the connection and retry to view the patient directory.
          </div>
        )}
      </section>

      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </>
  );
}
