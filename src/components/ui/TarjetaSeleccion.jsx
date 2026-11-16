export function TarjetaSeleccion({ seleccionado, onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${seleccionado ? "border-ink-950 bg-gray-50 ring-1 ring-ink-950" : "border-gray-200 bg-white"} ${className}`}
    >
      {children}
    </button>
  );
}
