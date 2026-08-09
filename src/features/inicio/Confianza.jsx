export function Confianza({ icon: IconComp, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
        <IconComp className="h-4 w-4" />
      </span>
      <span className="text-[11px] font-medium leading-tight text-gray-600">{label}</span>
    </div>
  );
}
