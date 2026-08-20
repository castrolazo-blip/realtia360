import { useMemo } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, EmptyState, SectionHeader, StatTile } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { formatMoney } from "../../lib/format.js";

const MES_CORTO = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export function Produccion() {
  const { agency, oficinaCartera, nombreAgente } = useAppData();

  const { delMes, historico, totalMes, totalAnio } = useMemo(() => {
    const ahora = new Date();
    const ganadas = oficinaCartera.oportunidades.filter((o) => o.estado === "ganada" && o.cerrada_en);

    const delMes = ganadas
      .filter((o) => {
        const d = new Date(o.cerrada_en);
        return d.getMonth() === ahora.getMonth() && d.getFullYear() === ahora.getFullYear();
      })
      .sort((a, b) => b.cerrada_en.localeCompare(a.cerrada_en));

    const porMes = new Map();
    for (let i = 5; i >= 0; i--) {
      const ref = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
      porMes.set(`${ref.getFullYear()}-${ref.getMonth()}`, { etiqueta: MES_CORTO[ref.getMonth()], cantidad: 0, valor: 0 });
    }
    for (const o of ganadas) {
      const d = new Date(o.cerrada_en);
      const clave = `${d.getFullYear()}-${d.getMonth()}`;
      const fila = porMes.get(clave);
      if (fila) { fila.cantidad++; fila.valor += Number(o.valor || 0); }
    }
    const historico = [...porMes.values()];

    const totalMes = delMes.reduce((s, o) => s + Number(o.valor || 0), 0);
    const totalAnio = ganadas.filter((o) => new Date(o.cerrada_en).getFullYear() === ahora.getFullYear()).reduce((s, o) => s + Number(o.valor || 0), 0);

    return { delMes, historico, totalMes, totalAnio };
  }, [oficinaCartera.oportunidades]);

  const maxHistorico = Math.max(1, ...historico.map((m) => m.valor));

  return (
    <div>
      <SectionHeader title="Producción" subtitle={`${agency.nombreOficina} · cierres de la oficina`} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <StatTile label="Cierres este mes" valor={delMes.length} icono={Icon.Crown} destacado={delMes.length > 0} />
        <StatTile label="Valor cerrado este mes" valor={formatMoney(totalMes)} icono={Icon.TrendUp} />
        <StatTile label="Valor cerrado este año" valor={formatMoney(totalAnio)} icono={Icon.Target} />
        <StatTile label="Cierres en los últimos 6 meses" valor={historico.reduce((s, m) => s + m.cantidad, 0)} icono={Icon.Clipboard} />
      </div>

      <h2 className="mb-3 font-display text-base font-semibold text-ink-950">Últimos 6 meses</h2>
      <Card className="mb-6 p-5">
        <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
          {historico.map((m) => (
            <div key={m.etiqueta} className="flex flex-1 flex-col items-center justify-end gap-1.5">
              <span className="text-[11px] font-semibold text-black/55">{m.cantidad > 0 ? formatMoney(m.valor) : ""}</span>
              <div
                className={`w-full rounded-t-md ${m.valor > 0 ? "bg-brand-600" : "bg-gray-100"}`}
                style={{ height: `${Math.max(4, (m.valor / maxHistorico) * 100)}px` }}
              />
              <span className="text-[11px] text-black/40">{m.etiqueta}</span>
            </div>
          ))}
        </div>
      </Card>

      <h2 className="mb-3 font-display text-base font-semibold text-ink-950">Cierres de este mes</h2>
      {delMes.length === 0 ? (
        <EmptyState title="Sin cierres todavía este mes" hint="En cuanto un asesor marque una oportunidad como ganada, aparece acá." />
      ) : (
        <div className="overflow-x-auto rounded-3xl border border-ink-900/5 bg-white shadow-card">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs font-semibold uppercase tracking-wide text-black/40">
                <th className="px-4 py-3">Asesor</th>
                <th className="px-4 py-3">Etapa cerrada</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Valor</th>
              </tr>
            </thead>
            <tbody>
              {delMes.map((o) => (
                <tr key={o.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium text-ink-950">{nombreAgente(o.agente_id)}</td>
                  <td className="px-4 py-3 text-black/55">Ganada</td>
                  <td className="px-4 py-3 tabular-nums text-black/55">{new Date(o.cerrada_en).toLocaleDateString("es-SV", { day: "numeric", month: "short" })}</td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-brand-700">{formatMoney(o.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
