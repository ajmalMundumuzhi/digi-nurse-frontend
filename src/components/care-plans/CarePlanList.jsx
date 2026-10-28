
import { ClipboardList, Eye } from "lucide-react";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

const statusStyles = {
  draft: "bg-slate-100 text-slate-700",
  active: "bg-emerald-50 text-emerald-700",
  on_hold: "bg-amber-50 text-amber-700",
  completed: "bg-blue-50 text-blue-700",
  discontinued: "bg-red-50 text-red-700"
};

function StatusBadge({ status }) {
  const value = status || "unknown";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyles[value] || "bg-slate-100 text-slate-600"}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

export default function CarePlanList({ plans, onView }) {
  if (!plans.length) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <ClipboardList size={25} />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-800">No care plans found</h3>
        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
          Choose another status or create a draft care plan for an active encounter.
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
              <th className="px-5 py-3.5">Care plan</th>
              <th className="px-4 py-3.5">Problems</th>
              <th className="px-4 py-3.5">Priority</th>
              <th className="px-4 py-3.5">Updated</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {plans.map((plan) => (
              <tr key={plan._id} className="transition hover:bg-teal-50/30">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <ClipboardList size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-800">{plan.title}</p>
                      <p className="mt-1 break-all text-[11px] text-slate-500">{plan.planNumber || plan._id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-xs text-slate-600">{plan.problems?.length || 0}</td>
                <td className="px-4 py-4 text-xs capitalize text-slate-600">{plan.priority || "medium"}</td>
                <td className="px-4 py-4 text-xs text-slate-500">{formatDate(plan.updatedAt || plan.createdAt)}</td>
                <td className="px-4 py-4"><StatusBadge status={plan.status} /></td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => onView(plan)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-50">
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
        {plans.map((plan) => (
          <article key={plan._id} className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <ClipboardList size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-sm font-semibold text-slate-800">{plan.title}</h3>
                <p className="mt-1 break-all text-xs text-slate-500">{plan.planNumber || plan._id}</p>
                <div className="mt-2"><StatusBadge status={plan.status} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-[10px] text-slate-400">Problems</p>
                <p className="mt-1 text-xs font-semibold text-slate-700">{plan.problems?.length || 0}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Priority</p>
                <p className="mt-1 text-xs font-semibold capitalize text-slate-700">{plan.priority || "medium"}</p>
              </div>
            </div>
            <button onClick={() => onView(plan)} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-teal-800 hover:bg-teal-50">
              <Eye size={15} />
              View care plan
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
