
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

function statusStyle(status) {
  const styles = {
    draft: "bg-slate-100 text-slate-700",
    submitted: "bg-amber-100 text-amber-800",
    acknowledged: "bg-emerald-100 text-emerald-800",
    amended: "bg-blue-100 text-blue-800",
  };

  return styles[status] || "bg-slate-100 text-slate-700";
}

function patientName(handover) {
  const patient = handover.patientId;

  if (patient && typeof patient === "object") {
    return (
      patient.fullName ||
      patient.name ||
      patient.patientNumber ||
      "Patient"
    );
  }

  return handover.patientName || "Patient";
}

function ActionButtons({
  handover,
  role,
  onView,
  onSubmit,
  onAcknowledge,
  busy,
}) {
  const canSubmit =
    ["nurse", "nurse_in_charge"].includes(role) &&
    handover.status === "draft";

  const canAcknowledge =
    ["nurse", "nurse_in_charge"].includes(role) &&
    handover.status === "submitted";

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onView(handover)}
        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
      >
        View
      </button>

      {canSubmit && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onSubmit(handover)}
          className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
        >
          Submit
        </button>
      )}

      {canAcknowledge && (
        <button
          type="button"
          disabled={busy}
          onClick={() => onAcknowledge(handover)}
          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Acknowledge
        </button>
      )}
    </div>
  );
}

export default function HandoverList({
  handovers = [],
  role,
  onView,
  onSubmit,
  onAcknowledge,
  busyId,
}) {
  if (!handovers.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
          <span className="text-xl">↔</span>
        </div>

        <h3 className="mt-4 font-semibold text-slate-900">
          No handovers found
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Create a handover or change the status filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4 font-semibold">Patient</th>
              <th className="px-5 py-4 font-semibold">Shift</th>
              <th className="px-5 py-4 font-semibold">Shift end</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {handovers.map((handover) => {
              const fromShift = handover.fromShift;
              const toShift = handover.toShift;

              const shiftEnd =
                getShiftEnd(fromShift, null) ||
                getShiftEnd(toShift, null) ||
                handover.endAt;

              return (
                <tr key={handover._id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">
                      {patientName(handover)}
                    </p>

                    <p className="mt-1 max-w-52 truncate text-xs text-slate-500">
                      {handover.summary || "No summary added"}
                    </p>
                  </td>

                  <td className="px-5 py-4 capitalize text-slate-600">
                    {getShiftLabel(fromShift)} → {getShiftLabel(toShift)}
                  </td>

                  <td className="px-5 py-4 text-slate-600">
                    {formatDate(shiftEnd)}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(
                        handover.status
                      )}`}
                    >
                      {handover.status || "unknown"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <ActionButtons
                      handover={handover}
                      role={role}
                      onView={onView}
                      onSubmit={onSubmit}
                      onAcknowledge={onAcknowledge}
                      busy={busyId === handover._id}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 p-3 md:hidden">
        {handovers.map((handover) => {
          const fromShift = handover.fromShift;
          const toShift = handover.toShift;

          const shiftEnd =
            getShiftEnd(fromShift, null) ||
            getShiftEnd(toShift, null) ||
            handover.endAt;

          return (
            <article
              key={handover._id}
              className="rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {patientName(handover)}
                  </h3>

                  <p className="mt-1 text-xs capitalize text-slate-500">
                    {getShiftLabel(fromShift)} shift →{" "}
                    {getShiftLabel(toShift)} shift
                  </p>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyle(
                    handover.status
                  )}`}
                >
                  {handover.status || "unknown"}
                </span>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                {handover.summary || "No summary added"}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                Shift end: {formatDate(shiftEnd)}
              </p>

              <div className="mt-4">
                <ActionButtons
                  handover={handover}
                  role={role}
                  onView={onView}
                  onSubmit={onSubmit}
                  onAcknowledge={onAcknowledge}
                  busy={busyId === handover._id}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
