
import { Search, X } from "lucide-react";

export default function PatientSearch({
  search,
  onSearchChange,
  limit,
  onLimitChange
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-slate-400 transition focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-600/10 sm:max-w-md">
        <Search size={18} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search by name or patient ID..."
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          aria-label="Search patients"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="rounded-md p-1 hover:bg-slate-100"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </label>

      <label className="flex items-center gap-2 text-xs text-slate-500">
        Rows
        <select
          value={limit}
          onChange={(event) => onLimitChange(Number(event.target.value))}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-600"
          aria-label="Patients per page"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        per page
      </label>
    </div>
  );
}
