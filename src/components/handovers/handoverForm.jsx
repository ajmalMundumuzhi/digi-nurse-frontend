
import { useState } from "react";

const initialForm = {
  encounterId: "",
  fromShift: "morning",
  toShift: "evening",
  startAt: "",
  endAt: "",
  incomingNurseId: "",
  summary: "",
  significantChanges: "",
  completedCare: "",
  pendingItems: "",
  activeCarePlanSummary: "",
  orderSummary: "",
  safetyConcerns: "",
};

function toLines(value) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function Field({ label, name, value, onChange, required = false, type = "text", placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{required && <span className="text-rose-500"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

export default function HandoverForm({ encounters = [], onSubmit, onCancel, saving = false }) {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!form.encounterId) {
      setFormError("Select an active patient encounter.");
      return;
    }

    if (!form.startAt || !form.endAt) {
      setFormError("Enter both shift start and end times.");
      return;
    }

    if (new Date(form.endAt) <= new Date(form.startAt)) {
      setFormError("The shift end time must be after the start time.");
      return;
    }

    const payload = {
      encounterId: form.encounterId,
      fromShift: form.fromShift,
      toShift: form.toShift,
      startAt: new Date(form.startAt).toISOString(),
      endAt: new Date(form.endAt).toISOString(),
      summary: form.summary.trim(),
      significantChanges: toLines(form.significantChanges),
      completedCare: toLines(form.completedCare),
      pendingItems: toLines(form.pendingItems),
      activeCarePlanSummary: form.activeCarePlanSummary.trim(),
      orderSummary: form.orderSummary.trim(),
      safetyConcerns: toLines(form.safetyConcerns),
    };

    if (form.incomingNurseId.trim()) {
      payload.incomingNurseId = form.incomingNurseId.trim();
    }

    try {
      await onSubmit(payload);
      setForm(initialForm);
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to create the handover."
      );
    }
  }

  const selectClass =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-4">
        <h3 className="font-semibold text-slate-900">Patient and shift details</h3>
        <p className="mt-1 text-sm text-slate-600">
          Use fictional data for the hackathon demo.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Active patient encounter <span className="text-rose-500">*</span>
            </span>
            <select
              name="encounterId"
              value={form.encounterId}
              onChange={handleChange}
              required
              className={selectClass}
            >
              <option value="">Select an encounter</option>
              {encounters.map((encounter) => {
                const patient = encounter.patientId;
                const patientName =
                  patient && typeof patient === "object"
                    ? patient.fullName || patient.name || patient.patientNumber
                    : encounter.patientName || "Patient";

                return (
                  <option key={encounter._id} value={encounter._id}>
                    {patientName} — {encounter.encounterNumber || encounter._id}
                  </option>
                );
              })}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Outgoing shift</span>
            <select name="fromShift" value={form.fromShift} onChange={handleChange} className={selectClass}>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Incoming shift</span>
            <select name="toShift" value={form.toShift} onChange={handleChange} className={selectClass}>
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
              <option value="night">Night</option>
            </select>
          </label>

          <Field label="Shift start" name="startAt" type="datetime-local" value={form.startAt} onChange={handleChange} required />
          <Field label="Shift end" name="endAt" type="datetime-local" value={form.endAt} onChange={handleChange} required />
          <div className="sm:col-span-2">
            <Field
              label="Incoming nurse MongoDB user ID"
              name="incomingNurseId"
              value={form.incomingNurseId}
              onChange={handleChange}
              placeholder="Paste the assigned nurse's _id, if available"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-slate-900">Clinical handover</h3>
        <div className="grid grid-cols-1 gap-4">
          <TextAreaField
            label="Patient condition summary"
            name="summary"
            value={form.summary}
            onChange={handleChange}
            placeholder="Summarize the patient's current condition"
            rows={4}
          />
          <TextAreaField
            label="Significant changes"
            name="significantChanges"
            value={form.significantChanges}
            onChange={handleChange}
            placeholder="Enter one item per line"
          />
          <TextAreaField
            label="Care completed"
            name="completedCare"
            value={form.completedCare}
            onChange={handleChange}
            placeholder="Enter completed care activities, one per line"
          />
          <TextAreaField
            label="Pending tasks"
            name="pendingItems"
            value={form.pendingItems}
            onChange={handleChange}
            placeholder="Enter outstanding tasks, one per line"
          />
          <TextAreaField
            label="Active nursing care plan summary"
            name="activeCarePlanSummary"
            value={form.activeCarePlanSummary}
            onChange={handleChange}
            placeholder="Summarize relevant care plans"
          />
          <TextAreaField
            label="Doctor orders summary"
            name="orderSummary"
            value={form.orderSummary}
            onChange={handleChange}
            placeholder="Summarize relevant orders and their status"
          />
          <TextAreaField
            label="Safety concerns"
            name="safetyConcerns"
            value={form.safetyConcerns}
            onChange={handleChange}
            placeholder="Enter risks or precautions, one item per line"
          />
        </div>
      </div>

      {formError && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {formError}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? "Saving..." : "Create handover"}
        </button>
      </div>
    </form>
  );
}
