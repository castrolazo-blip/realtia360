import { useMemo } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, EmptyState, SectionHeader, StatTile } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { formatMoney } from "../../lib/format.js";
import { calcularResumenPorAgente, calcularTotalesOficina } from "../agentes/resumenOficina.js";

// Vista de inicio del Broker: en vez de su propia cartera, ve cómo está el equipo. Los
// datos vienen de `oficinaCartera` (AppDataContext), que el RLS de Supabase solo llena
// para un perfil con rol 'broker' — este componente no filtra nada por seguridad, ya lo
// hizo la base de datos; aquí solo se agrupa y se muestra. El detalle por asesor vive en
// Agentes — acá solo el resumen ejecutivo.
export function OfficePulse() {
  const { agency, equipo, oficinaCartera, setVista } = useAppData();

  const porAgente = useMemo(() => calcularResumenPorAgente(equipo, oficinaCartera), [equipo, oficinaCartera]);
  const totales = useMemo(() => calcularTotalesOficina(porAgente), [porAgente]);
  const kycAltoRiesgoPendiente = oficinaCartera.kyc.filter((k) => k.nivel_riesgo === "alto" && k.estado === "pendiente").length;

  return (
    <div className="px-4 py-5 lg:px-0 lg:py-0">
      <SectionHeader title="Office Pulse" subtitle={`${agency.nombreOficina} · ${porAgente.length} ${porAgente.length === 1 ? "asesor" : "asesores"}`} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="Contactos en cartera" valor={totales.contactos} icono={Icon.Users} />
        <StatTile label="Oportunidades activas" valor={totales.oportunidadesActivas} icono={Icon.Target} />
        <StatTile label="Captaciones publicadas" valor={`${totales.captacionesPublicadas}/${totales.captaciones}`} icono={Icon.Clipboard} />
        <StatTile label="Cierres" valor={totales.cierres} icono={Icon.Crown} destacado={totales.cierres > 0} />
      </div>

      <div className="mb-6 rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 p-6 text-white shadow-premium lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Producción cerrada de la oficina</p>
        <p className="mt-1 font-display text-2xl font-semibold lg:text-3xl">{formatMoney(totales.valorCerrado)}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {totales.actividadesVencidas > 0 && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
              <Icon.Bell className="h-3.5 w-3.5" />
              {totales.actividadesVencidas} {totales.actividadesVencidas === 1 ? "actividad vencida" : "actividades vencidas"} en el equipo
            </p>
          )}
          {kycAltoRiesgoPendiente > 0 && (
            <p className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200">
              <Icon.Shield className="h-3.5 w-3.5" />
              {kycAltoRiesgoPendiente} {kycAltoRiesgoPendiente === 1 ? "expediente KYC de riesgo alto" : "expedientes KYC de riesgo alto"} sin revisar
            </p>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink-950">Equipo</h2>
        {porAgente.length > 0 && (
          <button onClick={() => setVista("agentes")} className="text-xs font-semibold text-brand-700">Ver detalle por agente →</button>
        )}
      </div>
      {porAgente.length === 0 ? (
        <EmptyState title="Todavía no hay asesores en tu oficina" hint="En cuanto alguien se registre con el mismo nombre de oficina, aparecerá aquí." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-ink-900/5 bg-white shadow-card">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-semibold uppercase tracking-wide text-black/40">
                <th className="px-4 py-3">Asesor</th>
                <th className="px-4 py-3">Contactos</th>
                <th className="px-4 py-3">Oportunidades</th>
                <th className="px-4 py-3">Captaciones</th>
                <th className="px-4 py-3">Cierres</th>
                <th className="px-4 py-3">Producción</th>
                <th className="px-4 py-3">Pendientes</th>
              </tr>
            </thead>
            <tbody>
              {porAgente.map((a) => (
                <tr key={a.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-950">
                    {a.nombre}
                    {a.esBroker && <span className="ml-2 rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-semibold text-gold-700">Broker</span>}
                  </td>
                  <td className="px-4 py-3 tabular-nums">{a.contactos}</td>
                  <td className="px-4 py-3 tabular-nums">{a.oportunidadesActivas}</td>
                  <td className="px-4 py-3 tabular-nums">{a.captacionesPublicadas}/{a.captaciones}</td>
                  <td className="px-4 py-3 tabular-nums">{a.cierres}</td>
                  <td className="px-4 py-3 tabular-nums">{formatMoney(a.valorCerrado)}</td>
                  <td className={`px-4 py-3 tabular-nums ${a.actividadesVencidas > 0 ? "font-semibold text-rose-600" : ""}`}>
                    {a.actividadesPendientes}
                    {a.actividadesVencidas > 0 && ` (${a.actividadesVencidas} vencidas)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
