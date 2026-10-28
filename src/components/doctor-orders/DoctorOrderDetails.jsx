
import { X } from "lucide-react";

function valueOrFallback(value) {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (typeof value === "object") return JSON.stringify(value, null, 2);
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

function Detail({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {valueOrFallback(value)}
      </p>
    </div>
  );
}

export default function DoctorOrderDetails({ order, onClose }) {
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
        aria-labelledby="doctor-order-detail-title"
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="min-w-0">
            <p className="text-[10px] font-bold tracking-[0.15em] text-teal-700">DOCTOR ORDERS</p>
            <h2 id="doctor-order-detail-title" className="mt-2 break-words text-xl font-bold text-slate-800">
              {order.title}
            </h2>
            <p className="mt-2 break-all text-xs text-slate-500">
              {order.orderNumber || order._id}
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close details">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label="Order type" value={order.orderType?.replaceAll("_", " ")} />
            <Detail label="Status" value={order.status?.replaceAll("_", " ")} />
            <Detail label="Priority" value={order.priority} />
            <Detail label="Ordered at" value={formatDate(order.orderedAt || order.createdAt)} />
            <Detail label="Ordered by" value={typeof order.orderedBy === "object" ? [order.orderedBy.firstName, order.orderedBy.lastName].filter(Boolean).join(" ") || order.orderedBy.staffId : order.orderedBy} />
            <Detail label="Authenticated at" value={formatDate(order.authenticatedAt)} />
          </div>

          <section>
            <h3 className="mb-2 text-sm font-bold text-slate-800">Description</h3>
            <p className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
              {valueOrFallback(order.description)}
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-bold text-slate-800">Clinical indication</h3>
            <p className="whitespace-pre-wrap break-words rounded-xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">
              {valueOrFallback(order.clinicalIndication)}
            </p>
          </section>

          {order.instructionDetails && (
            <section>
              <h3 className="mb-2 text-sm font-bold text-slate-800">Instruction details</h3>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-700">
                {JSON.stringify(order.instructionDetails, null, 2)}
              </pre>
            </section>
          )}

          {Array.isArray(order.nurseAcknowledgements) && order.nurseAcknowledgements.length > 0 && (
            <section>
              <h3 className="mb-2 text-sm font-bold text-slate-800">Nurse acknowledgements</h3>
              <div className="space-y-2">
                {order.nurseAcknowledgements.map((item, index) => (
                  <div key={`${item._id || item.nurseId || "ack"}-${index}`} className="rounded-xl border border-slate-200 p-4">
                    <p className="text-sm font-semibold text-slate-800">{valueOrFallback(item.status)}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDate(item.acknowledgedAt || item.createdAt)}</p>
                    {item.clarificationNote && (
                      <p className="mt-2 text-sm text-slate-600">{item.clarificationNote}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          <button onClick={onClose} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
