import { useState } from "react";
import { NAV_ASESOR, NAV_BROKER } from "../config/nav.js";
import { useAppData } from "../context/AppDataContext.jsx";
import { PlanBadge } from "../components/ui/PlanBadge.jsx";
import { Icon } from "../components/icons/Icon.jsx";
import { PerfilModal } from "../components/shared/PerfilModal.jsx";

// Shell de escritorio: sidebar fijo oscuro + barra superior de búsqueda, estilo
// panel profesional de gestión. Deliberadamente distinto del shell móvil
// (que usa una barra de pestañas inferior, estilo app nativa).
export function DesktopShell({ children }) {
  const { vista, setVista, agency } = useAppData();
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const esBroker = agency.rol === "broker";
  const nav = esBroker ? NAV_BROKER : NAV_ASESOR;

  return (
    <div className="min-h-screen bg-gray-50 pl-72">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col bg-ink-950 px-6 py-7 text-white">
        <div className="mb-9 flex items-center gap-3 px-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 font-display text-lg font-bold text-ink-950">
            R
          </div>
          <div>
            <p className="font-display text-lg font-semibold leading-tight text-white">{agency.producto}</p>
            <p className="text-[11px] uppercase tracking-wider text-white/40">{esBroker ? "Panel del broker" : "Panel del agente"}</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1.5">
          {nav.map((item) => {
            const activo = vista === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setVista(item.key)}
                className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                  activo ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${activo ? "bg-gold-500 text-ink-950" : "bg-white/5"}`}>
                  <item.icon className="h-[1.05rem] w-[1.05rem]" />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <button onClick={() => setPerfilAbierto(true)} className="rounded-2xl bg-white/5 p-3.5 text-left hover:bg-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-500/90 text-sm font-bold text-ink-950">
              {agency.inicialAgente}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{agency.nombreAgente}</p>
              <p className="truncate text-[11px] text-white/40">{agency.nombreOficina}</p>
            </div>
          </div>
          <div className="mt-3">
            <PlanBadge plan={agency.plan} />
          </div>
        </button>
      </aside>

      <header className="fixed inset-x-0 left-72 top-0 z-20 flex h-16 items-center justify-between border-b border-black/5 bg-white/85 px-8 backdrop-blur-md">
        <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-black/10 bg-gray-50 px-3.5 py-2">
          <Icon.Search className="h-4 w-4 text-black/35" />
          <span className="text-sm text-black/35">Buscar contacto, oportunidad o zona</span>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600">
            <Icon.Bell className="h-[1.1rem] w-[1.1rem]" />
          </button>
        </div>
      </header>

      <main className="px-8 pb-12 pt-24">{children}</main>

      <PerfilModal open={perfilAbierto} onClose={() => setPerfilAbierto(false)} />
    </div>
  );
}
