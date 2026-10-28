
import { useState } from "react";
import { LoaderCircle, Save, X } from "lucide-react";

const initialForm = {
  encounterId: "",
  recordType: "routine_observation",
  levelOfConsciousness: "Alert",
  mobilityStatus: "",
  additionalFindings: "",
  temperature: "",
  pulse: "",
  systolic: "",
  diastolic: "",
  respiratoryRate: "",
  oxygenSaturation: "",
  clinicalNotes: ""
};

const recordTypes = [
  { value: "initial_assessment", label: "Initial assessment" },
  { value: "routine_observation", label: "Routine observation" },
  { value: "nursing_progress_note", label: "Nursing progress note" },
  { value: "intervention_note", label: "Intervention note" },
  { value: "medication_administration", label: "Medication administration" },
  { value: "shift_assessment", label: "Shift assessment" }
];

export default function NursingRecordForm({ encounters, onSubmit, onClose, saving }) {
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
      setValidationError("Choose an active encounter first.");
      return;
    }

    const numericFields = [
      ["temperature", "Temperature"],
      ["pulse", "Pulse"],
      ["systolic", "Systolic blood pressure"],
      ["diastolic", "Diastolic blood pressure"],
      ["respiratoryRate", "Respiratory rate"],
      ["oxygenSaturation", "Oxygen saturation"]
    ];

    for (const [key, label] of numericFields) {
      if (form[key] !== "" && !Number.isFinite(Number(form[key]))) {
        setValidationError(`${label} must be a valid number.`);
        return;
      }
    }

    const vitalSigns = {};

    if (form.temperature !== "") {
      vitalSigns.temperature = { value: Number(form.temperature), unit: "C" };
    }

    if (form.pulse !== "") {
      vitalSigns.pulse = { value: Number(form.pulse), unit: "beats/min" };
    }

    if (form.systolic !== "" || form.diastolic !== "") {
      if (form.systolic === "" || form.diastolic === "") {
        setValidationError("Enter both systolic and diastolic values, or leave both blank.");
        return;
      }

      vitalSigns.bloodPressure = {
        systolic: Number(form.systolic),
        diastolic: Number(form.diastolic),
        unit: "mmHg"
      };
    }

    if (form.respiratoryRate !== "") {
      vitalSigns.respiratoryRate = {
        value: Number(form.respiratoryRate),
        unit: "breaths/min"
      };
    }

    if (form.oxygenSaturation !== "") {
      vitalSigns.oxygenSaturation = {
        value: Number(form.oxygenSaturation),
        unit: "%"
      };
    }

    const payload = {
      encounterId: form.encounterId,
      recordType: form.recordType,
      assessment: {
        levelOfConsciousness: form.levelOfConsciousness,
        mobilityStatus: form.mobilityStatus,
        additionalFindings: form.additionalFindings
      },
      vitalSigns,
      clinicalNotes: form.clinicalNotes
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
        aria-labelledby="nursing-record-form-title"
        className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-5 py-4 sm:px-7">
          <div>
            <h2 id="nursing-record-form-title" className="text-lg font-bold text-slate-800 sm:text-xl">
              Create nursing record
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Use fictional test information for this prototype.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-6 p-5 sm:p-7">
          <div>
            <SectionTitle title="Record information" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Active encounter" required>
                <select
                  name="encounterId"
                  value={form.encounterId}
                  onChange={update}
                  required
                  className={inputClass}
                >
                  <option value="">Choose an encounter</option>
                  {encounters.map((encounter) => (
                    <option key={encounter._id} value={encounter._id}>
                      {encounter.encounterNumber || encounter.encounterId || encounter._id}
                      {encounter.patientId?.firstName
                        ? ` · ${encounter.patientId.firstName} ${encounter.patientId.lastName || ""}`
                        : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Record type" required>
                <select
                  name="recordType"
                  value={form.recordType}
                  onChange={update}
                  className={inputClass}
                >
                  {recordTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </Field>
            </div>
          </div>

          <div>
            <SectionTitle title="Assessment" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Level of consciousness">
                <select
                  name="levelOfConsciousness"
                  value={form.levelOfConsciousness}
                  onChange={update}
                  className={inputClass}
                >
                  <option value="Alert">Alert</option>
                  <option value="Drowsy">Drowsy</option>
                  <option value="Confused">Confused</option>
                  <option value="Unresponsive">Unresponsive</option>
                </select>
              </Field>

              <Field label="Mobility status">
                <input
                  name="mobilityStatus"
                  value={form.mobilityStatus}
                  onChange={update}
                  className={inputClass}
                  placeholder="Enter demo observation"
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Additional findings">
                  <textarea
                    name="additionalFindings"
                    value={form.additionalFindings}
                    onChange={update}
                    rows={2}
                    className={textareaClass}
                    placeholder="Fictional assessment findings"
                  />
                </Field>
              </div>
            </div>
          </div>

          <div>
            <SectionTitle title="Vital signs" />
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Fields are optional. Enter only fictional test values in the prototype.
              This form does not validate clinical safety.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-3">
              <NumberField name="temperature" label="Temperature (°C)" value={form.temperature} onChange={update} />
              <NumberField name="pulse" label="Pulse (beats/min)" value={form.pulse} onChange={update} />
              <NumberField name="systolic" label="Systolic (mmHg)" value={form.systolic} onChange={update} />
              <NumberField name="diastolic" label="Diastolic (mmHg)" value={form.diastolic} onChange={update} />
              <NumberField name="respiratoryRate" label="Respiratory rate" value={form.respiratoryRate} onChange={update} />
              <NumberField name="oxygenSaturation" label="Oxygen saturation (%)" value={form.oxygenSaturation} onChange={update} />
            </div>
          </div>

          <div>
            <SectionTitle title="Clinical notes" />
            <div className="mt-4">
              <Field label="Notes">
                <textarea
                  name="clinicalNotes"
                  value={form.clinicalNotes}
                  onChange={update}
                  rows={3}
                  className={textareaClass}
                  placeholder="Enter fictional notes for workflow testing"
                />
              </Field>
            </div>
          </div>

          {validationError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {validationError}
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || encounters.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
              {saving ? "Saving..." : "Save nursing record"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

const inputClass = "h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";
const textareaClass = "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10";

function Field({ label, required, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-xs font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}

function NumberField({ name, label, value, onChange }) {
  return (
    <Field label={label}>
      <input
        type="number"
        step="any"
        name={name}
        value={value}
        onChange={onChange}
        className={inputClass}
        placeholder="Optional"
      />
    </Field>
  );
}

function SectionTitle({ title }) {
  return (
    <h3 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-800">
      {title}
    </h3>
  );
}
