
function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function getShiftLabel(shift) {
  if (!shift) return "—";
  if (typeof shift === "string") return shift;

  if (typeof shift === "object") {
    return shift.shiftType || "—";
  }

  return "—";
}

function getShiftStart(shift, fallback) {
  if (shift && typeof shift === "object" && shift.startAt) {
    return shift.startAt;
  }

  return fallback;
}

function getShiftEnd(shift, fallback) {
  if (shift && typeof shift === "object" && shift.endAt) {
    return shift.endAt;
  }

  return fallback;
}

function displayName(value) {
  if (!value) return "—";

  if (typeof value === "object") {
    return (
      value.fullName ||
      value.name ||
      value.staffId ||
      value._id ||
      "—"
    );
  }

  return value;
}

function formatListItem(item) {
  if (typeof item === "string") return item;

  if (item && typeof item === "object") {
    return item.description || item.title || item.name || "Details unavailable";
  }

  return String(item);
}

function DetailSection({ title, value, list = false }) {
  const items = Array.isArray(value) ? value : [];

  return (
    <section className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>

      {list ? (
        items.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
            {items.map((item, index) => (
              <li key={`${title}-${index}`}>{formatListItem(item)}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-400">
            No items recorded.
          </p>
        )
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
          {typeof value === "string" || typeof value === "number"
            ? value || "No information recorded."
            : value && typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : "No information recorded."}
        </p>
      )}
    </section>
  );
}

export default function HandoverDetails({
  handover,
  onClose,
  onAcknowledge,
  canAcknowledge,
  busy,
}) {
  if (!handover) return null;

  const patient =
    handover.patientId && typeof handover.patientId === "object"
      ? handover.patientId.fullName ||
        handover.patientId.name ||
        handover.patientId.patientNumber
      : handover.patientName;

  const fromShift = handover.fromShift;
  const toShift = handover.toShift;

  const startAt =
    getShiftStart(fromShift, null) ||
    getShiftStart(toShift, null) ||
    handover.startAt;

  const endAt =
    getShiftEnd(fromShift, null) ||
    getShiftEnd(toShift, null) ||
    handover.endAt;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="handover-details-title"
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-700">
              Shift handover
            </p>

            <h2
              id="handover-details-title"
              className="mt-1 text-xl font-bold text-slate-900"
            >
              {patient || "Patient handover"}
            </h2>

            <p className="mt-1 text-sm capitalize text-slate-500">
              {getShiftLabel(fromShift)} → {getShiftLabel(toShift)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close handover details"
            className="rounded-xl px-3 py-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-teal-50 p-4">
              <p className="text-xs font-medium text-teal-800">Shift start</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(startAt)}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-800">Shift end</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(endAt)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailSection title="Patient condition" value={handover.summary} />

            <DetailSection
              title="Significant changes"
              value={handover.significantChanges}
              list
            />

            <DetailSection
              title="Care completed"
              value={handover.completedCare}
              list
            />

            <DetailSection
              title="Pending tasks"
              value={handover.pendingItems}
              list
            />

            <DetailSection
              title="Active care plan"
              value={handover.activeCarePlanSummary}
            />

            <DetailSection title="Doctor orders" value={handover.orderSummary} />

            <div className="sm:col-span-2">
              <DetailSection
                title="Safety concerns"
                value={handover.safetyConcerns}
                list
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 p-4 text-sm">
            <p className="font-semibold text-slate-800">
              Handover responsibility
            </p>

            <div className="mt-2 grid grid-cols-1 gap-2 text-slate-600 sm:grid-cols-2">
              <p>
                Outgoing nurse: {displayName(handover.outgoingNurseId)}
              </p>

              <p>
                Incoming nurse: {displayName(handover.incomingNurseId)}
              </p>
            </div>

            <p className="mt-3 text-xs capitalize text-slate-500">
              Status: {handover.status || "unknown"}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>

            {canAcknowledge && (
              <button
                type="button"
                disabled={busy}
                onClick={() => onAcknowledge(handover)}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? "Acknowledging..." : "Acknowledge handover"}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
