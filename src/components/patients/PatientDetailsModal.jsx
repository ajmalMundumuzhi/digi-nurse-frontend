
import { useEffect, useState } from "react";
import { CalendarDays, LoaderCircle, Phone, UserRound, X } from "lucide-react";
import { getPatientById } from "../../services/patientService";

function displayValue(value) {
  if (value === undefined || value === null || value === "") return "Not provided";
  return String(value);
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not provided";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export default function PatientDetailsModal({ patient, onClose }) {
  const [details, setDetails] = useState(patient);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDetails() {
      setLoading(true);
      setError("");

      try {
        const result = await getPatientById(patient._id);

        if (active) setDetails(result);
      } catch (requestError) {
        if (active) {
          setError(
            requestError.response?.data?.message ||
            "Could not load additional patient details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetails();

    return () => {
      active = false;
    };
  }, [patient._id]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const name = [
    details.firstName ?? details.first_name,
    details.lastName ?? details.last_name
  ].filter(Boolean).join(" ") || details.fullName || details.name || "Patient";

  const patientId = details.patientNumber ?? details.patientId ?? details.mrn ?? details._id;
  const phone = details.phone ?? details.phoneNumber ?? details.contactNumber;
  const gender = details.gender ?? details.sex;
  const dateOfBirth = details.dateOfBirth ?? details.dob;
  const status = details.status ?? "Not specified";

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="patient-detail-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700">
              <UserRound size={24} />
            </div>
            <div className="min-w-0">
              <h2 id="patient-detail-title" className="truncate text-xl font-bold text-slate-800">
                {name}
              </h2>
              <p className="mt-1 break-all text-xs text-slate-500">
                Patient ID: {displayValue(patientId)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close patient details"
          >
            <X size={20} />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading patient details...
          </div>
        )}

        {error && (
          <p role="alert" className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            {error} Showing the information available from the patient list.
          </p>
        )}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Detail label="Gender" value={gender} />
          <Detail label="Date of birth" value={formatDate(dateOfBirth)} icon={CalendarDays} />
          <Detail label="Phone" value={phone} icon={Phone} />
          <Detail label="Status" value={status} />
        </div>

        {!loading && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">Institution record</p>
            <p className="mt-2 break-all text-sm text-slate-700">
              {displayValue(details._id)}
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Close
        </button>
      </section>
    </div>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon size={15} />}
        <span className="text-xs">{label}</span>
      </div>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {displayValue(value)}
      </p>
    </div>
  );
}
