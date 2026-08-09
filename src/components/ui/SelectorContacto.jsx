import { useState } from "react";
import { Icon } from "../icons/Icon.jsx";

// Selector de contacto con buscador y botones grandes, en vez de un <select> con decenas
// de opciones apretadas en un menú desplegable.
export function SelectorContacto({ contactos, valor, onChange, permitirNinguno = false, etiquetaNinguno = "Sin contacto" }) {
  const [q, setQ] = useState("");
  const seleccionado = contactos.find((c) => c.id === valor);
  const filtrados = contactos.filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()));

  if (seleccionado) {
    return (
      <div className="flex items-center justify-between rounded-xl border-2 border-brand-600 bg-brand-50 px-3.5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-700">
            {seleccionado.nombre.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{seleccionado.nombre}</p>
            {(seleccionado.empresa || seleccionado.ciudad) && <p className="truncate text-xs text-black/45">{seleccionado.empresa || seleccionado.ciudad}</p>}
          </div>
        </div>
        <button type="button" onClick={() => onChange("")} className="shrink-0 text-xs font-semibold text-brand-700">
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-gray-50 px-3.5 py-3">
        <Icon.Search className="h-4 w-4 text-black/35" />
        <input
          autoFocus
          placeholder="Buscar contacto por nombre…"
          className="flex-1 bg-transparent text-sm outline-none"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto rounded-xl border border-black/5 p-1.5">
        {permitirNinguno && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-black/45 hover:bg-gray-50"
          >
            {etiquetaNinguno}
          </button>
        )}
        {filtrados.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left hover:bg-brand-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
              {c.nombre.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">{c.nombre}</p>
              {(c.empresa || c.ciudad) && <p className="truncate text-xs text-black/45">{c.empresa || c.ciudad}</p>}
            </div>
          </button>
        ))}
        {filtrados.length === 0 && <p className="px-3 py-4 text-center text-sm text-black/40">Sin resultados.</p>}
      </div>
    </div>
  );
}
