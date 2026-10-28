
import { CheckCircle2, Eye, FileText, ShieldCheck } from "lucide-react";

const labels = {
  medication: "Medication",
  lab: "Laboratory",
  imaging: "Imaging",
  procedure: "Procedure",
  nursing_instruction: "Nursing instruction",
  other: "Other"
};

const statusStyles = {
  draft: "bg-slate-100 text-slate-700",
  pending_authentication: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-700",
  completed: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
  discontinued: "bg-slate-100 text-slate-600"
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

function StatusBadge({ status }) {
  const value = status || "unknown";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[value] || "bg-slate-100 text-slate-600"}`}>
      {value.replaceAll("_", " ")}
    </span>
  );
}

export default function DoctorOrderList({
  orders,
  role,
  busyOrderId,
  onView,
  onAuthenticate,
  onAcknowledge
}) {
  if (!orders.length) {
    return (
      <div className="flex flex-col items-center justify-center px-5 py-14 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <FileText size={25} />
        </div>
        <h3 className="mt-4 text-sm font-bold text-slate-800">No orders found</h3>
        <p className="mt-2 max-w-sm text-xs leading-5 text-slate-500">
          Choose another encounter or status filter, or create an order if you are signed in as a doctor.
        </p>
      </div>
    );
  }

  const actions = (order) => (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        onClick={() => onView(order)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
      >
        <Eye size={14} />
        View
      </button>

      {role === "doctor" && order.status === "pending_authentication" && (
        <button
          disabled={busyOrderId === order._id}
          onClick={() => onAuthenticate(order)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-800 disabled:opacity-50"
        >
          <ShieldCheck size={14} />
          Authenticate
        </button>
      )}

      {["nurse", "nurse_in_charge"].includes(role) && order.status === "active" && (
        <button
          disabled={busyOrderId === order._id}
          onClick={() => onAcknowledge(order)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          <CheckCircle2 size={14} />
          Acknowledge
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[800px] text-left">
          <thead className="border-y border-slate-100 bg-slate-50/80">
            <tr className="text-[11px] font-semibold text-slate-500">
              <th className="px-5 py-3.5">Order</th>
              <th className="px-4 py-3.5">Priority</th>
              <th className="px-4 py-3.5">Ordered at</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-teal-50/30">
                <td className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                      <FileText size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="break-words text-sm font-semibold text-slate-800">{order.title}</p>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {labels[order.orderType] || order.orderType || "Order"} · {order.orderNumber || order._id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className={`text-xs font-semibold capitalize ${order.priority === "emergency" ? "text-red-700" : order.priority === "urgent" ? "text-amber-700" : "text-slate-600"}`}>
                    {order.priority || "routine"}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs text-slate-500">{formatDate(order.orderedAt || order.createdAt)}</td>
                <td className="px-4 py-4"><StatusBadge status={order.status} /></td>
                <td className="px-5 py-4">{actions(order)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-100 md:hidden">
        {orders.map((order) => (
          <article key={order._id} className="space-y-3 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <FileText size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="break-words text-sm font-semibold text-slate-800">{order.title}</h3>
                <p className="mt-1 break-all text-xs text-slate-500">{order.orderNumber || order._id}</p>
                <p className="mt-1 text-xs capitalize text-slate-500">
                  {(labels[order.orderType] || order.orderType || "Order")} · {order.priority || "routine"} priority
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500">Ordered: {formatDate(order.orderedAt || order.createdAt)}</p>
            {actions(order)}
          </article>
        ))}
      </div>
    </>
  );
}
