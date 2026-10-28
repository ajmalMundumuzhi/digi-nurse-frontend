
import { useState } from "react";
import { LoaderCircle, Save, X } from "lucide-react";

const inputClass = "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";
const textareaClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

export default function CarePlanForm({ encounters, onSubmit, onClose, saving }) {
  const [form, setForm] = useState({
    encounterId: encounters[0]?._id || "",
    title: "",
    priority: "medium",
    diagnosisName: "",
    problemDescription: "",
    problemPriority: "medium",
    supportingEvidence: "",
    goalDescription: "",
    successCriteria: "",
    interventionDescription: "",
    interventionType: "monitoring",
    frequency: ""
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

    if (!form.title.trim() || !form.diagnosisName.trim()) {
      setValidationError("Enter a care plan title and a problem name.");
      return;
    }

    const payload = {
      encounterId: form.encounterId,
      title: form.title.trim(),
      priority: form.priority,
      problems: [
        {
          diagnosisName: form.diagnosisName.trim(),
          description: form.problemDescription.trim(),
          priority: form.problemPriority,
          supportingEvidence: form.supportingEvidence
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          goals: form.goalDescription.trim()
            ? [{
                description: form.goalDescription.trim(),
                successCriteria: form.successCriteria.trim()
              }]
            : [],
          interventions: form.interventionDescription.trim()
            ? [{
                description: form.interventionDescription.trim(),
                interventionType: form.interventionType,
                frequency: form.frequency.trim()
              }]
            : []
        }
      ]
    };

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
        aria-labelledby="care-plan-form-title"
        className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5 sm:px-7">
          <div>
            <h2 id="care-plan-form-title" className="text-xl font-bold text-slate-800">
              Create draft care plan
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use fictional information for workflow testing.
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close form">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6 p-5 sm:p-7">
          <section>
            <SectionTitle title="Care plan information" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Active encounter">
                <select name="encounterId" value={form.encounterId} onChange={update} className={inputClass} required>
                  <option value="">Choose an encounter</option>
                  {encounters.map((encounter) => (
                    <option key={encounter._id} value={encounter._id}>
                      {encounter.encounterNumber || encounter.encounterId || encounter._id}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Plan priority">
                <select name="priority" value={form.priority} onChange={update} className={inputClass}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>

              <div className="sm:col-span-2">
                <Field label="Plan title">
                  <input name="title" value={form.title} onChange={update} required maxLength={200} className={inputClass} placeholder="e.g. Demo care coordination plan" />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle title="Care problem" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Problem or diagnosis name">
                <input name="diagnosisName" value={form.diagnosisName} onChange={update} required className={inputClass} placeholder="Enter a fictional problem name" />
              </Field>
              <Field label="Problem priority">
                <select name="problemPriority" value={form.problemPriority} onChange={update} className={inputClass}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field label="Problem description">
                  <textarea name="problemDescription" value={form.problemDescription} onChange={update} rows={2} className={textareaClass} placeholder="Describe the fictional problem" />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Supporting evidence (one item per line)">
                  <textarea name="supportingEvidence" value={form.supportingEvidence} onChange={update} rows={2} className={textareaClass} placeholder="Optional demo observations" />
                </Field>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle title="Goal" />
            <div className="mt-4 grid grid-cols-1 gap-4">
              <Field label="Goal description">
                <textarea name="goalDescription" value={form.goalDescription} onChange={update} rows={2} className={textareaClass} placeholder="Enter a fictional goal" />
              </Field>
              <Field label="Success criteria">
                <textarea name="successCriteria" value={form.successCriteria} onChange={update} rows={2} className={textareaClass} placeholder="Describe how the demo goal would be evaluated" />
              </Field>
            </div>
          </section>

          <section>
            <SectionTitle title="Intervention" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Intervention type">
                <select name="interventionType" value={form.interventionType} onChange={update} className={inputClass}>
                  <option value="monitoring">Monitoring</option>
                  <option value="documentation">Documentation</option>
                  <option value="comfort">Comfort</option>
                  <option value="mobility">Mobility</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Frequency">
                <input name="frequency" value={form.frequency} onChange={update} className={inputClass} placeholder="Optional demo frequency" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Intervention description">
                  <textarea name="interventionDescription" value={form.interventionDescription} onChange={update} rows={3} className={textareaClass} placeholder="Enter a fictional intervention" />
                </Field>
              </div>
            </div>
          </section>

          {validationError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{validationError}</p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={saving || !encounters.length} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? "Saving..." : "Save draft"}
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

function SectionTitle({ title }) {
  return <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-800">{title}</h3>;
}