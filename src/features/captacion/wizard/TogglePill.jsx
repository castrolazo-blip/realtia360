export function TogglePill({ label, checked, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition ${checked ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-500"}`}
    >
      {label}
    </button>
  );
}
