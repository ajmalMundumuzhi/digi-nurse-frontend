
import { X } from "lucide-react";

function showValue(value) {
  if (value === null || value === undefined || value === "") return "Not recorded";
  if (Array.isArray(value)) return value.join(", ") || "Not recorded";
  return String(value);
}

function formatDate(value) {
  if (!value) return "Not recorded";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function Vital({ label, value, unit }) {
  const display = value?.value ?? value;

  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words text-base font-bold text-slate-800">
        {display === undefined || display === null || display === ""
          ? "—"
          : `${display}${unit ? ` ${unit}` : value?.unit ? ` ${value.unit}` : ""}`}
      </p>
    </div>
  );
}

export default function NursingRecordDetails({ record, onClose }) {
  const assessment = record.assessment || {};
  const vitals = record.vitalSigns || {};

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="nursing-record-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5 sm:p-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.15em] text-teal-700">
              NURSING DOCUMENTATION
            </p>
            <h2 id="nursing-record-detail-title" className="mt-2 text-xl font-bold text-slate-800">
              {String(record.recordType || "Nursing record").replaceAll("_", " ")}
            </h2>
            <p className="mt-2 text-xs text-slate-500">
              Recorded {formatDate(record.recordedAt || record.createdAt)}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <section>
            <h3 className="mb-3 text-sm font-bold text-slate-800">Vital signs</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Vital label="Temperature" value={vitals.temperature} />
              <Vital label="Pulse" value={vitals.pulse} />
              <Vital label="Blood pressure" value={vitals.bloodPressure ? `${vitals.bloodPressure.systolic ?? "—"}/${vitals.bloodPressure.diastolic ?? "—"}` : null} unit={vitals.bloodPressure?.unit || "mmHg"} />
              <Vital label="Respiratory rate" value={vitals.respiratoryRate} />
              <Vital label="Oxygen saturation" value={vitals.oxygenSaturation} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-slate-800">Assessment</h3>
            <div className="space-y-3 rounded-xl border border-slate-200 p-4 text-sm">
              <Detail label="Level of consciousness" value={assessment.levelOfConsciousness} />
              <Detail label="Orientation" value={assessment.orientation} />
              <Detail label="Mobility" value={assessment.mobilityStatus} />
              <Detail label="Additional findings" value={assessment.additionalFindings} />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-bold text-slate-800">Clinical notes</h3>
            <p className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {showValue(record.clinicalNotes)}
            </p>
          </section>

          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-lg bg-slate-100 px-3 py-2">Status: {showValue(record.status)}</span>
            <span className="rounded-lg bg-slate-100 px-3 py-2">Record ID: {showValue(record._id)}</span>
          </div>

          <button onClick={onClose} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4">
      <span className="shrink-0 text-xs text-slate-500">{label}</span>
      <span className="break-words text-sm text-slate-700 sm:text-right">{showValue(value)}</span>
    </div>
  );
}
