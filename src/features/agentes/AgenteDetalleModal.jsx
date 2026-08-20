import { useMemo } from "react";
import { Modal, Badge } from "../../components/ui/index.js";
import { Icon, TIPO_ICON } from "../../components/icons/Icon.jsx";
import { ETAPA_LABEL, ETAPAS } from "../../constants/oportunidades.js";
import { ESTADO_CAPTACION_LABEL, ESTADOS_CAPTACION } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";
import { formatDia, formatHora } from "../../lib/dates.js";

// Dashboard individual del asesor, visto por el Broker — de solo lectura, armado a partir
// de oficinaCartera (las mismas filas crudas que ya trae Office Pulse), filtradas al
// agente seleccionado.
export function AgenteDetalleModal({ agente, oficinaCartera, onClose }) {
  const propias = useMemo(() => {
    if (!agente) return null;
    const id = agente.id;
    return {
      oportunidades: oficinaCartera.oportunidades.filter((o) => o.agente_id === id),
      captaciones: oficinaCartera.captaciones.filter((c) => c.agente_id === id),
      actividades: oficinaCartera.actividades.filter((a) => a.agente_id === id),
    };
  }, [agente, oficinaCartera]);

  if (!agente || !propias) return null;

  const activas = propias.oportunidades.filter((o) => o.estado === "activa");
  const porEtapa = ETAPAS.map((etapa) => ({ etapa, cantidad: activas.filter((o) => o.etapa === etapa).length }));
  const porEstadoCaptacion = ESTADOS_CAPTACION.map((estado) => ({ estado, cantidad: propias.captaciones.filter((c) => c.estado === estado).length })).filter((e) => e.cantidad > 0);

  const ahora = new Date();
  const pendientes = propias.actividades
    .filter((a) => a.estado === "pendiente")
    .sort((a, b) => a.fecha_hora.localeCompare(b.fecha_hora))
    .slice(0, 6);

  const cierres = propias.oportunidades.filter((o) => o.estado === "ganada");
  const valorCerrado = cierres.reduce((s, o) => s + Number(o.valor || 0), 0);

  return (
    <Modal open onClose={onClose} title={agente.nombre_agente || agente.nombre}>
      <div className="flex flex-col gap-5">
        {agente.rol === "broker" && <Badge className="self-start bg-gold-100 text-gold-700">Broker</Badge>}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Oportunidades activas</p>
            <p className="text-lg font-bold text-gray-900">{activas.length}</p>
          </div>
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Cierres</p>
            <p className="text-lg font-bold text-gray-900">{cierres.length} · {formatMoney(valorCerrado)}</p>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Pipeline por etapa</h3>
          <div className="flex flex-col gap-1.5">
            {porEtapa.map((e) => (
              <div key={e.etapa} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-xs text-black/55">{ETAPA_LABEL[e.etapa]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-brand-600" style={{ width: activas.length ? `${(e.cantidad / activas.length) * 100}%` : "0%" }} />
                </div>
                <span className="w-5 shrink-0 text-right text-xs font-semibold text-black/60">{e.cantidad}</span>
              </div>
            ))}
            {activas.length === 0 && <p className="text-xs text-black/40">Sin oportunidades activas.</p>}
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Captaciones ({propias.captaciones.length})</h3>
          {porEstadoCaptacion.length === 0 ? (
            <p className="text-xs text-black/40">Sin captaciones todavía.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {porEstadoCaptacion.map((e) => (
                <Badge key={e.estado} className="bg-indigo-50 text-indigo-700">{ESTADO_CAPTACION_LABEL[e.estado]} · {e.cantidad}</Badge>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Próximas actividades</h3>
          {pendientes.length === 0 ? (
            <p className="text-xs text-black/40">Sin actividades pendientes.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {pendientes.map((a) => {
                const IconComp = TIPO_ICON[a.tipo] || Icon.Check;
                const vencida = new Date(a.fecha_hora) < ahora;
                return (
                  <div key={a.id} className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2">
                    <IconComp className="h-3.5 w-3.5 shrink-0 text-black/40" />
                    <p className="min-w-0 flex-1 truncate text-sm text-gray-800">{a.titulo}</p>
                    <span className={`shrink-0 text-xs ${vencida ? "font-semibold text-rose-600" : "text-black/40"}`}>
                      {formatDia(a.fecha_hora)} · {formatHora(a.fecha_hora)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
