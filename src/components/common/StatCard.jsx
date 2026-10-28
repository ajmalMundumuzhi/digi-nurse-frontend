
export default function StatCard({ label, value, note, icon: Icon, tone = "teal" }) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    amber: "bg-amber-50 text-amber-700"
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-900/[0.02] transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{label}</p>

        <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${tones[tone] || tones.teal}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-800">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-400">{note}</p>
    </article>
  );
}
