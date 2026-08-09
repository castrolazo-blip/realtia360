export function ContadorGrande({ label, valor, onCambiar }) {
  return (
    <div className={`flex items-center justify-between rounded-2xl border-2 p-3.5 ${valor > 0 ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"}`}>
      <span className={`text-base font-semibold ${valor > 0 ? "text-brand-900" : "text-gray-700"}`}>{label}</span>
      <div className="flex items-center gap-3">
        <button onClick={() => onCambiar(Math.max(0, valor - 1))} className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-white text-lg font-bold text-gray-600 active:scale-95">
          −
        </button>
        <span className="w-5 text-center text-lg font-bold text-gray-900">{valor}</span>
        <button onClick={() => onCambiar(valor + 1)} className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-lg font-bold text-white active:scale-95">
          +
        </button>
      </div>
    </div>
  );
}
