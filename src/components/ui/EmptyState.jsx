export function EmptyState({ title, hint }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 px-6 py-12 text-center">
      <p className="font-display text-lg font-semibold text-ink-950">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-black/50">{hint}</p>}
    </div>
  );
}
