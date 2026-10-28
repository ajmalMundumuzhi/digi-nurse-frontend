
import { useState } from "react";
import { LoaderCircle, Save, X } from "lucide-react";

const initialForm = {
  encounterId: "",
  orderType: "nursing_instruction",
  title: "",
  description: "",
  clinicalIndication: "",
  priority: "routine",
  instructionCategory: "monitoring",
  instruction: "",
  frequency: ""
};

const orderTypes = [
  { value: "medication", label: "Medication" },
  { value: "lab", label: "Laboratory investigation" },
  { value: "imaging", label: "Imaging" },
  { value: "procedure", label: "Procedure" },
  { value: "nursing_instruction", label: "Nursing instruction" },
  { value: "other", label: "Other" }
];

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";
const textareaClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

export default function DoctorOrderForm({ encounters, onSubmit, onClose, saving }) {
  const [form, setForm] = useState({
    ...initialForm,
    encounterId: encounters[0]?._id || ""
  });
  const [validationError, setValidationError] = useState("");

  const update = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setValidationError("");

    if (!form.encounterId) {
      setValidationError("Choose an active encounter.");
      return;
    }

    if (!form.title.trim()) {
      setValidationError("Enter an order title.");
      return;
    }

    const payload = {
      encounterId: form.encounterId,
      orderType: form.orderType,
      title: form.title.trim(),
      description: form.description.trim(),
      clinicalIndication: form.clinicalIndication.trim(),
      priority: form.priority
    };

    if (form.orderType === "nursing_instruction") {
      if (!form.instruction.trim()) {
        setValidationError("Enter the nursing instruction.");
        return;
      }

      payload.instructionDetails = {
        instructionCategory: form.instructionCategory,
        instruction: form.instruction.trim(),
        frequency: form.frequency.trim()
      };
    }

    try {
      await onSubmit(payload);
    } catch {
      // The parent displays the API error.
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="doctor-order-form-title"
        className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5 sm:px-7">
          <div>
            <h2 id="doctor-order-form-title" className="text-xl font-bold text-slate-800">
              Create doctor order
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use fictional information for prototype testing.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close form">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 sm:p-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Active encounter">
              <select name="encounterId" value={form.encounterId} onChange={update} required className={inputClass}>
                <option value="">Choose an encounter</option>
                {encounters.map((encounter) => (
                  <option key={encounter._id} value={encounter._id}>
                    {encounter.encounterNumber || encounter.encounterId || encounter._id}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Order type">
              <select name="orderType" value={form.orderType} onChange={update} className={inputClass}>
                {orderTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field label="Order title">
                <input name="title" value={form.title} onChange={update} required maxLength={200} className={inputClass} placeholder="Enter a concise order title" />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Description">
                <textarea name="description" value={form.description} onChange={update} rows={3} className={textareaClass} placeholder="Fictional description for workflow testing" />
              </Field>
            </div>

            <div className="sm:col-span-2">
              <Field label="Clinical indication">
                <textarea name="clinicalIndication" value={form.clinicalIndication} onChange={update} rows={2} className={textareaClass} placeholder="Demo indication" />
              </Field>
            </div>

            <Field label="Priority">
              <select name="priority" value={form.priority} onChange={update} className={inputClass}>
                <option value="routine">Routine</option>
                <option value="urgent">Urgent</option>
                <option value="emergency">Emergency</option>
              </select>
            </Field>
          </div>

          {form.orderType === "nursing_instruction" && (
            <section className="rounded-2xl border border-teal-100 bg-teal-50/50 p-4 sm:p-5">
              <h3 className="text-sm font-bold text-slate-800">Nursing instruction details</h3>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Instruction category">
                  <select name="instructionCategory" value={form.instructionCategory} onChange={update} className={inputClass}>
                    <option value="monitoring">Monitoring</option>
                    <option value="comfort">Comfort</option>
                    <option value="mobility">Mobility</option>
                    <option value="safety">Safety</option>
                    <option value="other">Other</option>
                  </select>
                </Field>
                <Field label="Frequency">
                  <input name="frequency" value={form.frequency} onChange={update} className={inputClass} placeholder="Demo frequency" />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Instruction">
                    <textarea name="instruction" value={form.instruction} onChange={update} required rows={3} className={textareaClass} placeholder="Enter fictional instruction text" />
                  </Field>
                </div>
              </div>
            </section>
          )}

          {form.orderType !== "nursing_instruction" && (
            <p className="rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-800">
              This form currently collects general order details for this type. Medication, investigation, and procedure-specific structured fields will need to match the exact validation schema before those order types are used.
            </p>
          )}

          {validationError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{validationError}</p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving || !encounters.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? "Saving..." : "Create order"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
