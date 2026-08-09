export function TarjetaSeleccion({ seleccionado, onClick, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition ${seleccionado ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"} ${className}`}
    >
      {children}
    </button>
  );
}
