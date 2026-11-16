import { useMemo } from "react";
import { Modal, Badge } from "../../components/ui/index.js";
import { Icon, TIPO_ICON } from "../../components/icons/Icon.jsx";
import { TIPO_ACT_LABEL } from "../../constants/actividades.js";
import { inicioDeSemana } from "../llamar/gestion.js";
import { ETAPA_LABEL, ETAPAS } from "../../constants/oportunidades.js";
import { ESTADO_CAPTACION_LABEL, ESTADOS_CAPTACION } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";

// Dashboard individual del asesor, visto por el Broker — SOLO NÚMEROS: oficinaCartera
// viene de realtia_metricas_oficina, que nunca incluye nombres, teléfonos ni títulos de
// actividades de los clientes del asesor.
export function AgenteDetalleModal({ agente, oficinaCartera, onClose }) {
  const propias = useMemo(() => {
    if (!agente) return null;
    const id = agente.id;
    return {
      oportunidades: oficinaCartera.oportunidades.filter((o) => o.agente_id === id),
      captaciones: oficinaCartera.captaciones.filter((c) => c.agente_id === id),
      actividades: oficinaCartera.actividades.filter((a) => a.agente_id === id),
      interacciones: (oficinaCartera.interacciones || []).filter((i) => i.agente_id === id),
    };
  }, [agente, oficinaCartera]);

  if (!agente || !propias) return null;

  const activas = propias.oportunidades.filter((o) => o.estado === "activa");
  const porEtapa = ETAPAS.map((etapa) => ({ etapa, cantidad: activas.filter((o) => o.etapa === etapa).length }));
  const porEstadoCaptacion = ESTADOS_CAPTACION.map((estado) => ({ estado, cantidad: propias.captaciones.filter((c) => c.estado === estado).length })).filter((e) => e.cantidad > 0);

  const ahora = new Date();
  const pendientes = propias.actividades.filter((a) => a.estado === "pendiente");
  const pendientesPorTipo = Object.entries(
    pendientes.reduce((acc, a) => {
      const f = (acc[a.tipo] ||= { total: 0, vencidas: 0 });
      f.total++;
      if (new Date(a.fecha_hora) < ahora) f.vencidas++;
      return acc;
    }, {})
  ).sort((a, b) => b[1].total - a[1].total);
  const semana = inicioDeSemana();
  const deLaSemana = propias.interacciones.filter((i) => new Date(i.created_at) >= semana);
  const gestionSemana = {
    intentos: deLaSemana.length,
    efectivos: deLaSemana.filter((i) => i.efectivo).length,
    citas: deLaSemana.filter((i) => i.cita).length,
  };

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
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Gestión de llamadas esta semana</h3>
          <div className="grid grid-cols-3 gap-2">
            {[["Intentos", gestionSemana.intentos], ["Efectivos", gestionSemana.efectivos], ["Citas", gestionSemana.citas]].map(([l, v]) => (
              <div key={l} className="rounded-xl bg-gray-100 p-3">
                <p className="text-xs text-black/45">{l}</p>
                <p className="text-lg font-bold text-gray-900">{v}</p>
              </div>
            ))}
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
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Actividades pendientes ({pendientes.length})</h3>
          {pendientesPorTipo.length === 0 ? (
            <p className="text-xs text-black/40">Sin actividades pendientes.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {pendientesPorTipo.map(([tipo, f]) => {
                const IconComp = TIPO_ICON[tipo] || Icon.Check;
                return (
                  <div key={tipo} className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2">
                    <IconComp className="h-3.5 w-3.5 shrink-0 text-black/40" />
                    <p className="min-w-0 flex-1 truncate text-sm text-gray-800">{TIPO_ACT_LABEL[tipo] || tipo}</p>
                    <span className="shrink-0 text-sm font-semibold text-gray-900">{f.total}</span>
                    {f.vencidas > 0 && <span className="shrink-0 text-xs font-semibold text-rose-600">{f.vencidas} vencidas</span>}
                  </div>
                );
              })}
            </div>
          )}
          <p className="mt-2 text-[11px] text-black/40">Solo números: los contactos de cada asesor son privados.</p>
        </div>
      </div>
    </Modal>
  );
}
