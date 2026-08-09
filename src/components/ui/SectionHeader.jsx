export function SectionHeader({ title, action, subtitle }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-950">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-black/45">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
