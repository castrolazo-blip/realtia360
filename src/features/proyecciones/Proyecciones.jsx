import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { SectionHeader, Button } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { formatMoney } from "../../lib/format.js";
import { oportunidadFromRow } from "../../lib/db/mappers.js";
import { calcularNegocio, metaConfigurada } from "../inicio/negocio.js";
import { ConfigurarMetaModal } from "../inicio/ConfigurarMetaModal.jsx";

// Proyección de la oficina completa — reutiliza el mismo motor que "Realtia Coach" (Inicio
// del asesor), pero corrido sobre el embudo de toda la oficina en vez de uno individual.
// La meta que se usa como base es la del perfil del Broker (Configurar meta), pensada acá
// como la meta de la oficina, no la personal.
export function Proyecciones() {
  const { agency, oficinaCartera } = useAppData();
  const [metaAbierta, setMetaAbierta] = useState(false);

  const oportunidadesOficina = useMemo(() => oficinaCartera.oportunidades.map(oportunidadFromRow), [oficinaCartera.oportunidades]);
  const negocio = useMemo(() => calcularNegocio(oportunidadesOficina, agency), [oportunidadesOficina, agency]);

  return (
    <div>
      <SectionHeader
        title="Proyecciones"
        subtitle={`${agency.nombreOficina} · con base en la meta configurada`}
        action={
          <Button variant="secondary" onClick={() => setMetaAbierta(true)}>
            {metaConfigurada(agency) ? "Editar meta" : "Configurar meta"}
          </Button>
        }
      />

      {!negocio ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 p-6 text-white shadow-premium lg:p-8">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gold-400/10" />
          <p className="relative font-display text-lg font-semibold leading-snug lg:text-2xl">Definí la meta de la oficina</p>
          <p className="relative mt-1 text-sm text-white/60">
            Con meta anual, comisión promedio y precio promedio de venta, Realtia calcula la proyección de toda
            la oficina a partir del embudo actual de todo el equipo.
          </p>
          <button onClick={() => setMetaAbierta(true)} className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950">
            <Icon.Bolt className="h-4 w-4" /> Configurar meta
          </button>
        </div>
      ) : (
        <>
          <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 p-6 text-white shadow-premium lg:p-8">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gold-400/10" />
            <div className="absolute -bottom-10 right-10 h-28 w-28 rounded-full bg-white/5" />
            <p className="relative text-xs font-semibold uppercase tracking-wide text-white/50">Meta {new Date().getFullYear()}</p>
            <p className="relative mt-1 font-display text-2xl font-semibold lg:text-3xl">{formatMoney(negocio.metaAnual)}</p>

            <div className="relative mt-4 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${negocio.progresoPct}%` }} />
            </div>
            <p className="relative mt-2 text-sm text-white/70">
              {negocio.faltante > 0
                ? `Faltan ${formatMoney(negocio.faltante)} para la meta — la oficina va al ${negocio.progresoPct}%.`
                : "¡La oficina ya alcanzó la meta de este año! 🎉"}
            </p>

            <div className="relative mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              <MetaStat label="Cerrado este año" valor={formatMoney(negocio.cerradoEsteAnio)} />
              <MetaStat label="Pipeline ponderado" valor={formatMoney(negocio.pipelinePonderado)} />
              <MetaStat label="Proyección" valor={formatMoney(negocio.proyeccion)} />
              <MetaStat label="Cierres que faltan" valor={negocio.cierresFaltantes != null ? `${negocio.cierresFaltantes} de ${negocio.cierresNecesarios}` : "—"} />
            </div>
          </div>

          <p className="text-xs text-black/45">
            El pipeline ponderado pesa cada oportunidad activa de la oficina según su etapa (10% recién nueva,
            hasta 85% en cierre) — no es una promesa, es un supuesto razonable para saber si el ritmo actual
            alcanza.
          </p>
        </>
      )}

      <ConfigurarMetaModal open={metaAbierta} onClose={() => setMetaAbierta(false)} />
    </div>
  );
}

function MetaStat({ label, valor }) {
  return (
    <div className="rounded-2xl bg-white/5 p-3">
      <p className="font-display text-lg font-semibold text-white lg:text-xl">{valor}</p>
      <p className="mt-0.5 text-[11px] text-white/50">{label}</p>
    </div>
  );
}
