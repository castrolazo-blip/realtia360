export function Chip({ children, activo, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
        activo ? "bg-brand-700 text-white" : "border border-black/10 bg-white text-black/55 hover:bg-brand-50"
      }`}
    >
      {children}
    </button>
  );
}
