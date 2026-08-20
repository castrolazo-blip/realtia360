import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { formatMoney } from "../../lib/format.js";
import { calcularResumenPorAgente } from "./resumenOficina.js";
import { AgenteDetalleModal } from "./AgenteDetalleModal.jsx";

// Roster de la oficina — quién es cada quien, cómo va cada quien, y entrada al detalle
// individual (equivalente al "Dashboard individual del asesor" del plano original).
export function Agentes() {
  const { agency, equipo, oficinaCartera } = useAppData();
  const [seleccionadoId, setSeleccionadoId] = useState(null);

  const porAgente = useMemo(() => calcularResumenPorAgente(equipo, oficinaCartera), [equipo, oficinaCartera]);
  const seleccionado = equipo.find((a) => a.id === seleccionadoId);

  return (
    <div>
      <SectionHeader title="Agentes" subtitle={`${agency.nombreOficina} · ${porAgente.length} ${porAgente.length === 1 ? "persona" : "personas"}`} />

      {porAgente.length === 0 ? (
        <EmptyState title="Todavía no hay asesores en tu oficina" hint="En cuanto alguien se registre con el mismo nombre de oficina, aparecerá aquí." />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {porAgente.map((a) => (
            <Card key={a.id} className="cursor-pointer overflow-hidden p-0 hover:border-black/15">
              <button className="block w-full p-4 text-left" onClick={() => setSeleccionadoId(a.id)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                      {a.nombre.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{a.nombre}</p>
                      {a.esBroker && <Badge className="mt-0.5 bg-gold-100 text-gold-700">Broker</Badge>}
                    </div>
                  </div>
                  {a.actividadesVencidas > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600">
                      <Icon.Bell className="h-3 w-3" />{a.actividadesVencidas}
                    </span>
                  )}
                </div>

                <div className="mt-3.5 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-base font-bold text-gray-900">{a.contactos}</p>
                    <p className="text-[10px] uppercase tracking-wide text-black/40">Contactos</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{a.oportunidadesActivas}</p>
                    <p className="text-[10px] uppercase tracking-wide text-black/40">Oport.</p>
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900">{a.captacionesPublicadas}/{a.captaciones}</p>
                    <p className="text-[10px] uppercase tracking-wide text-black/40">Captac.</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3">
                  <span className="text-xs text-black/45">Producción</span>
                  <span className="text-sm font-bold text-brand-700">{formatMoney(a.valorCerrado)}</span>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}

      <AgenteDetalleModal agente={seleccionado} oficinaCartera={oficinaCartera} onClose={() => setSeleccionadoId(null)} />
    </div>
  );
}
