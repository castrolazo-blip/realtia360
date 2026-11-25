import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { AREAS_VIDA } from "../../constants/plan.js";
import { calcularMetasPlan } from "./calculos.js";
import { formatMoney } from "../../lib/format.js";
import { PlanWizard } from "./PlanWizard.jsx";
import { inicioDeSemana } from "../llamar/gestion.js";
import { TIPOS_BLOQUE, DIAS, ORDEN_SEMANA, INDICADORES, REVISION_MENSUAL, bloquesDelDia, horasPorTipo, tituloBloque, hora12 } from "./agenda.js";

// "Mi plan": el plan de negocio firmado, para verlo todos los días como pide el cuaderno.
// Cada sección se edita con un toque (abre el asistente en esa página) y se puede imprimir.
export function MiPlan() {
  const { plan, oportunidades, interacciones, captaciones, agency } = useAppData();
  const [editarEn, setEditarEn] = useState(null);
  if (!plan) return null;
  const calc = calcularMetasPlan(plan);
  const cierresDelAnio = oportunidades.filter((o) => o.estado === "ganada" && o.cerradaEn && new Date(o.cerradaEn).getFullYear() === plan.anio).length;
  const avance = calc ? Math.min(100, Math.round((cierresDelAnio / calc.transacciones) * 100)) : 0;
  const seg = plan.seguimiento || {};
  const bloques = plan.agenda?.bloques || [];
  // Seguimiento: lo real de esta semana y este mes contra lo que pide el plan.
  const semana = inicioDeSemana();
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const deSemana = interacciones.filter((i) => new Date(i.creadoEn) >= semana);
  const ganadasMes = oportunidades.filter((o) => o.estado === "ganada" && o.cerradaEn && new Date(o.cerradaEn) >= inicioMes);
  const reales = {
    llamadas: { real: deSemana.length, meta: calc?.semana.intentos, periodo: "esta semana" },
    efectivos: { real: deSemana.filter((i) => i.efectivo).length, meta: calc?.semana.efectivos, periodo: "esta semana" },
    citas: { real: deSemana.filter((i) => i.cita).length, meta: calc?.semana.citas, periodo: "esta semana" },
    captaciones: { real: captaciones.filter((c) => c.creadoEn && new Date(c.creadoEn) >= inicioMes).length, meta: calc ? Math.max(1, Math.ceil(calc.mes.cierres * 1.5)) : null, periodo: "este mes" },
    cierres: { real: ganadasMes.length, meta: calc?.mes.cierres, periodo: "este mes" },
    comision: { real: cierresDelAnio * (plan.comisionPromedio || 0), meta: plan.metaMonetaria, periodo: `en ${plan.anio}`, dinero: true },
  };

  return (
    <div className="mx-auto max-w-3xl print:max-w-none">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-black/45">Plan de negocio</p>
          <h1 className="text-3xl font-extrabold text-ink-950">{plan.anio}</h1>
        </div>
        <button onClick={() => window.print()} className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-ink-950 print:hidden">Imprimir</button>
      </div>

      <div className="mb-4 rounded-3xl bg-ink-950 p-6 text-white">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/50">Mi "¿Por qué?"</p>
        <p className="mt-2 text-xl font-semibold italic leading-snug">“{plan.porQue}”</p>
        {calc && (
          <>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <p className="text-3xl font-extrabold">{formatMoney(plan.metaMonetaria)}</p>
                <p className="text-sm text-white/60">{formatMoney(plan.metaMonetaria)} ÷ {formatMoney(plan.comisionPromedio)} = {calc.transacciones} transacciones</p>
              </div>
              <p className="text-right text-sm text-white/70"><b className="text-2xl text-gold-400">{cierresDelAnio}</b> / {calc.transacciones}</p>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gold-500" style={{ width: `${avance}%` }} /></div>
          </>
        )}
        <Editar onClick={() => setEditarEn("negocio")} oscuro />
      </div>

      {calc && (
        <Seccion titulo="Mi ritmo para lograrlo" onEditar={() => setEditarEn("negocio")}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Dato l="Llamadas al día" v={calc.dia.intentos} />
            <Dato l="Efectivos al día" v={calc.dia.efectivos} />
            <Dato l="Citas por semana" v={calc.semana.citas} />
            <Dato l="Cierres por mes" v={calc.mes.cierres} />
          </div>
        </Seccion>
      )}

      <Seccion titulo="Mi seguimiento" onEditar={() => setEditarEn("seguimiento")}>
        <p className="mb-3 text-sm text-black/55">
          Reviso mi plan cada <b className="text-ink-950">{DIAS[seg.dia ?? 1]?.toLowerCase()} a las {hora12(seg.hora || "08:00")}</b>
          {seg.mensual && seg.mensual !== "ninguna" ? <> · con mi broker: <b className="text-ink-950">{REVISION_MENSUAL[seg.mensual]?.toLowerCase()}</b></> : null}
        </p>
        <div className="flex flex-col gap-3">
          {(seg.indicadores || Object.keys(INDICADORES)).filter((k) => reales[k]).map((k) => {
            const r = reales[k];
            const pct = r.meta ? Math.min(100, Math.round((r.real / r.meta) * 100)) : 0;
            return (
              <div key={k}>
                <div className="flex justify-between text-sm"><span className="font-semibold text-ink-950">{INDICADORES[k]} <span className="font-normal text-black/40">{r.periodo}</span></span>
                  <span className="text-black/60">{r.dinero ? formatMoney(r.real) : r.real} de {r.dinero ? formatMoney(r.meta) : r.meta ?? "—"}</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${pct >= 100 ? "bg-brand-600" : pct >= 60 ? "bg-gold-500" : "bg-rose-400"}`} style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </div>
      </Seccion>

      <Seccion titulo="Mi semana" onEditar={() => setEditarEn("agenda")}>
        {bloques.length === 0 ? <p className="text-sm text-black/45">Aún no ordenas tu agenda.</p> : (
          <>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {horasPorTipo(bloques).map(([t, h]) => (
                <span key={t} className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white" style={{ background: (TIPOS_BLOQUE[t] || TIPOS_BLOQUE.otro).color }}>{(TIPOS_BLOQUE[t] || TIPOS_BLOQUE.otro).label} · {h} h</span>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {ORDEN_SEMANA.filter((d) => bloquesDelDia(bloques, d).length).map((d) => (
                <div key={d}>
                  <p className="mb-1 text-xs font-bold uppercase tracking-wide text-black/45">{DIAS[d]}</p>
                  {bloquesDelDia(bloques, d).map((b) => (
                    <p key={b.id} className="flex gap-2 text-sm text-ink-950">
                      <span className="w-[118px] shrink-0 whitespace-nowrap text-black/45">{hora12(b.ini)}–{hora12(b.fin)}</span>
                      <span className="truncate font-semibold" style={{ color: (TIPOS_BLOQUE[b.tipo] || TIPOS_BLOQUE.otro).color }}>{tituloBloque(b)}</span>
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </Seccion>

      <Seccion titulo="Visión" onEditar={() => setEditarEn("vision")}><p className="text-[15px] text-ink-950">{plan.vision}</p></Seccion>
      <Seccion titulo="Misión" onEditar={() => setEditarEn("mision")}><p className="text-[15px] text-ink-950">{plan.mision}</p></Seccion>
      <Seccion titulo="Valores" onEditar={() => setEditarEn("valores")}>
        <div className="flex flex-wrap gap-1.5">{plan.valores.map((v) => <span key={v} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-ink-950">{v}</span>)}</div>
      </Seccion>
      <Seccion titulo={`Metas ${plan.anio}`} onEditar={() => setEditarEn("metas")}><ListaAreas valores={plan.metas} /></Seccion>
      <Seccion titulo={`Logros del ${plan.anio - 1}`} onEditar={() => setEditarEn("logros")}><ListaAreas valores={plan.logros} /></Seccion>

      <p className="mb-8 mt-6 text-center text-sm text-black/45">
        Yo, <b className="text-ink-950">{agency.nombreAgente}</b>, escribí este plan el {plan.compromisoEn ? new Date(plan.compromisoEn).toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" }) : "—"} y me comprometo a verlo todos los días.
      </p>

      {editarEn != null && <PlanWizard inicial={editarEn} alTerminar={() => setEditarEn(null)} />}
    </div>
  );
}

function Seccion({ titulo, onEditar, children }) {
  return (
    <section className="relative mb-3 rounded-3xl border border-black/[0.06] bg-white p-5 shadow-card print:break-inside-avoid print:shadow-none">
      <h2 className="mb-2 pr-16 text-base font-bold text-ink-950">{titulo}</h2>
      {children}
      <Editar onClick={onEditar} />
    </section>
  );
}

function Editar({ onClick, oscuro }) {
  return (
    <button onClick={onClick} className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold print:hidden ${oscuro ? "bg-white/10 text-white" : "bg-gray-100 text-ink-950"}`}>
      Editar
    </button>
  );
}

function ListaAreas({ valores }) {
  const con = AREAS_VIDA.filter((a) => (valores?.[a.key] || "").trim());
  if (!con.length) return <p className="text-sm text-black/45">Sin completar.</p>;
  return (
    <div className="flex flex-col gap-2">
      {con.map((a) => (
        <div key={a.key}>
          <p className="text-xs font-semibold text-black/45">{a.icono} {a.label}</p>
          <p className="whitespace-pre-line text-[15px] text-ink-950">{valores[a.key]}</p>
        </div>
      ))}
    </div>
  );
}

function Dato({ l, v }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-3">
      <p className="text-2xl font-extrabold text-ink-950">{v}</p>
      <p className="text-[11px] text-black/50">{l}</p>
    </div>
  );
}
