export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-black/55">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15";
