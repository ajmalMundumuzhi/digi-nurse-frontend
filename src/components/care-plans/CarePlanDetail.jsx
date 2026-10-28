
import { ClipboardList, X } from "lucide-react";

function display(value) {
  if (value === null || value === undefined || value === "") return "Not provided";
  if (Array.isArray(value)) return value.map(display).join(", ") || "Not provided";
  return String(value);
}

function Section({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}

function ItemCard({ title, description, status, children }) {
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h4 className="break-words text-sm font-semibold text-slate-800">{title}</h4>
        {status && (
          <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">
            {String(status).replaceAll("_", " ")}
          </span>
        )}
      </div>
      {description && (
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
          {description}
        </p>
      )}
      {children}
    </article>
  );
}

export default function CarePlanDetails({ plan, onClose }) {
  const problems = Array.isArray(plan.problems) ? plan.problems : [];

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
        aria-labelledby="care-plan-detail-title"
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white p-5 sm:p-6">
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700">
              <ClipboardList size={21} />
            </div>
            <div className="min-w-0">
              <h2 id="care-plan-detail-title" className="break-words text-xl font-bold text-slate-800">
                {plan.title}
              </h2>
              <p className="mt-1 break-all text-xs text-slate-500">
                {plan.planNumber || plan._id}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Close care plan">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Summary label="Status" value={plan.status} />
            <Summary label="Priority" value={plan.priority} />
            <Summary label="Version" value={plan.version ?? 1} />
          </div>

          <Section title={`Problems (${problems.length})`}>
            {problems.length ? (
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <div key={problem.problemId || `${problem.diagnosisName}-${index}`} className="rounded-2xl border border-slate-200 p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="break-words font-bold text-slate-800">{problem.diagnosisName}</h4>
                        {problem.diagnosisCode && <p className="mt-1 text-xs text-slate-500">Code: {problem.diagnosisCode}</p>}
                      </div>
                      <span className="w-fit rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold capitalize text-slate-600">
                        {problem.status || "active"}
                      </span>
                    </div>

                    <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                      {display(problem.description)}
                    </p>

                    {problem.supportingEvidence?.length > 0 && (
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-slate-700">Supporting evidence</p>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                          {problem.supportingEvidence.map((item, itemIndex) => (
                            <li key={`${item}-${itemIndex}`}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-5 space-y-3">
                      <p className="text-xs font-bold text-teal-800">Goals</p>
                      {problem.goals?.length ? problem.goals.map((goal, goalIndex) => (
                        <ItemCard
                          key={goal.goalId || `${goal.description}-${goalIndex}`}
                          title={goal.description}
                          description={goal.successCriteria}
                          status={goal.status}
                        >
                          {goal.targetDate && <p className="mt-2 text-xs text-slate-500">Target date: {new Date(goal.targetDate).toLocaleDateString("en-IN")}</p>}
                          {goal.evaluationNotes && <p className="mt-2 text-sm text-slate-600">Evaluation: {goal.evaluationNotes}</p>}
                        </ItemCard>
                      )) : <p className="text-xs text-slate-500">No goals recorded.</p>}
                    </div>

                    <div className="mt-5 space-y-3">
                      <p className="text-xs font-bold text-teal-800">Interventions</p>
                      {problem.interventions?.length ? problem.interventions.map((intervention, interventionIndex) => (
                        <ItemCard
                          key={intervention.interventionId || `${intervention.description}-${interventionIndex}`}
                          title={intervention.description}
                          description={intervention.frequency}
                          status={intervention.status}
                        >
                          {intervention.patientResponse && <p className="mt-2 text-sm text-slate-600">Response: {intervention.patientResponse}</p>}
                          {intervention.exceptionReason && <p className="mt-2 text-sm text-amber-700">Exception: {intervention.exceptionReason}</p>}
                        </ItemCard>
                      )) : <p className="text-xs text-slate-500">No interventions recorded.</p>}
                    </div>

                    {problem.evaluation && (
                      <div className="mt-5 rounded-xl bg-slate-50 p-4">
                        <p className="text-xs font-bold text-slate-700">Latest evaluation</p>
                        <p className="mt-2 text-sm capitalize text-slate-700">
                          Outcome: {display(problem.evaluation.outcome)}
                        </p>
                        {problem.evaluation.findings && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{problem.evaluation.findings}</p>}
                        {problem.evaluation.goalProgress && <p className="mt-2 text-sm text-slate-600">Goal progress: {problem.evaluation.goalProgress}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">No problems have been added.</p>
            )}
          </Section>

          <button onClick={onClose} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Close
          </button>
        </div>
      </section>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-2 break-words text-sm font-bold capitalize text-slate-800">
        {display(value).replaceAll("_", " ")}
      </p>
    </div>
  );
}
