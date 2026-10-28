
import { Eye, FileText } from "lucide-react";

const recordLabels = {
  initial_assessment: "Initial assessment",
  routine_observation: "Routine observation",
  nursing_progress_note: "Progress note",
  intervention_note: "Intervention note",
  medication_administration: "Medication administration",
  shift_assessment: "Shift assessment"
};

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function getRecordType(record) {
  return recordLabels[record.recordType] || String(record.recordType || "Nursing record").replaceAll("_", " ");
}

function getAuthor(record) {
  const author = record.createdBy;

  if (!author || typeof author !== "object") return "Staff member";

  return [
    author.firstName,
    author.lastName
  ].filter(Boolean).join(" ") || author.staffId || "Staff member";
}

export default function NursingRecordList({ records, onViewRecord }) {
  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <FileText size={25} />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-800">No nursing records yet</h3>
        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
          Select an encounter or create a record to begin testing the documentation workflow.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[650px] text-left">
          <thead className="border-y border-slate-100 bg-slate-50/80">
            <tr className="text-[11px] font-semibold text-slate-500">
              <th className="px-5 py-3.5">Record type</th>
              <th className="px-4 py-3.5">Recorded at</th>
              <th className="px-4 py-3.5">Created by</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((record) => (
              <tr key={record._id} className="transition hover:bg-teal-50/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <FileText size={17} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {getRecordType(record)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">
                  {formatDate(record.recordedAt || record.createdAt)}
                </td>
                <td className="px-4 py-4 text-xs text-slate-600">{getAuthor(record)}</td>
                <td className="px-4 py-4">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600">
                    {String(record.status || "unknown").replaceAll("_", " ")}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => onViewRecord(record)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50"
                  >
                    <Eye size={15} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {records.map((record) => (
          <article key={record._id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <FileText size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-sm font-semibold text-slate-800">
                  {getRecordType(record)}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(record.recordedAt || record.createdAt)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Created by: {getAuthor(record)}
                </p>
              </div>
              <button
                onClick={() => onViewRecord(record)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50"
              >
                <Eye size={14} />
                View
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
