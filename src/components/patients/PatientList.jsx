
import { Eye, Users } from "lucide-react";

function getName(patient) {
  return [
    patient.firstName ?? patient.first_name,
    patient.lastName ?? patient.last_name
  ].filter(Boolean).join(" ") || patient.fullName || patient.name || "Unnamed patient";
}

function getIdentifier(patient) {
  return patient.patientNumber ?? patient.patientId ?? patient.mrn ?? patient._id ?? "—";
}

function getGender(patient) {
  return patient.gender ?? patient.sex ?? "Not specified";
}

function getDateOfBirth(patient) {
  const value = patient.dateOfBirth ?? patient.dob;

  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function StatusBadge({ status }) {
  const normalized = String(status ?? "unknown").toLowerCase();

  const styles = {
    active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    admitted: "bg-blue-50 text-blue-700 ring-blue-600/20",
    discharged: "bg-slate-100 text-slate-600 ring-slate-500/20",
    inactive: "bg-amber-50 text-amber-700 ring-amber-600/20"
  };

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${styles[normalized] || "bg-slate-100 text-slate-600 ring-slate-500/20"}`}>
      {normalized.replaceAll("_", " ")}
    </span>
  );
}

export default function PatientList({ patients, onViewPatient }) {
  if (!patients.length) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <Users size={25} />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-800">No patients found</h3>
        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
          Try another search term or clear your search to see the patient directory.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-y border-slate-100 bg-slate-50/80">
            <tr className="text-[11px] font-semibold text-slate-500">
              <th className="px-5 py-3.5">Patient</th>
              <th className="px-4 py-3.5">Patient ID</th>
              <th className="px-4 py-3.5">Gender</th>
              <th className="px-4 py-3.5">Date of birth</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {patients.map((patient) => (
              <tr key={patient._id} className="transition hover:bg-teal-50/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-xs font-bold text-teal-800">
                      {getName(patient).charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-700">{getName(patient)}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">{getIdentifier(patient)}</td>
                <td className="px-4 py-4 text-xs capitalize text-slate-600">{getGender(patient)}</td>
                <td className="px-4 py-4 text-xs text-slate-600">{getDateOfBirth(patient)}</td>
                <td className="px-4 py-4"><StatusBadge status={patient.status} /></td>
                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() => onViewPatient(patient)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:border-teal-200 hover:bg-teal-50"
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
        {patients.map((patient) => (
          <article key={patient._id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 font-bold text-teal-800">
                {getName(patient).charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="break-words text-sm font-semibold text-slate-800">
                  {getName(patient)}
                </h3>
                <p className="mt-1 break-all text-xs text-slate-500">
                  ID: {getIdentifier(patient)}
                </p>
                <div className="mt-2"><StatusBadge status={patient.status} /></div>
              </div>

              <button
                onClick={() => onViewPatient(patient)}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50"
              >
                <Eye size={14} />
                View
              </button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-[10px] text-slate-400">Gender</p>
                <p className="mt-1 text-xs font-medium capitalize text-slate-700">{getGender(patient)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Date of birth</p>
                <p className="mt-1 text-xs font-medium text-slate-700">{getDateOfBirth(patient)}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
