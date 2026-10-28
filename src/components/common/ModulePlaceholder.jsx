
export default function ModulePlaceholder({ icon: Icon, eyebrow, title, description }) {
  return (
    <section>
      <div className="mb-7">
        <p className="mb-2 text-[10px] font-bold tracking-[0.16em] text-teal-700">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>

      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-700">
          <Icon size={26} strokeWidth={1.7} />
        </div>
        <h3 className="mt-5 text-base font-bold text-slate-800">
          {title} workspace
        </h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
          {description} This screen will be connected to the NurseFlow API in the next implementation stage.
        </p>
        <span className="mt-5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
          UI scaffold ready
        </span>
      </div>
    </section>
  );
}
