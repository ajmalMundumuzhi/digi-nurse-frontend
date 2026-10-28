
export default function PageHeader({
  eyebrow,
  title,
  description,
  action
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-teal-700">
            {eyebrow}
          </p>
        )}

        <h2 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
