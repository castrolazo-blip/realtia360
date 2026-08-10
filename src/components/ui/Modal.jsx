export function Modal({ open, onClose, title, children, mostrarCerrar = true }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-6 shadow-premium sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold text-ink-950">{title}</h2>
          {mostrarCerrar && (
            <button onClick={onClose} className="rounded-full p-1.5 text-black/40 hover:bg-black/5">
              ✕
            </button>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}
