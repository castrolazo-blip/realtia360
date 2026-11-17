import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { AREAS_VIDA } from "../../constants/plan.js";
import { calcularMetasPlan } from "./calculos.js";
import { formatMoney } from "../../lib/format.js";
import { PlanWizard } from "./PlanWizard.jsx";

// "Mi plan": el plan de negocio firmado, para verlo todos los días como pide el cuaderno.
// Cada sección se edita con un toque (abre el asistente en esa página) y se puede imprimir.
export function MiPlan() {
  const { plan, oportunidades, contactos, agency } = useAppData();
  const [editarEn, setEditarEn] = useState(null);
  if (!plan) return null;
  const calc = calcularMetasPlan(plan);
  const cierresDelAnio = oportunidades.filter((o) => o.estado === "ganada" && o.cerradaEn && new Date(o.cerradaEn).getFullYear() === plan.anio).length;
  const avance = calc ? Math.min(100, Math.round((cierresDelAnio / calc.transacciones) * 100)) : 0;
  const clientes = contactos.filter((c) => plan.clientesPotenciales.includes(c.id));

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
        <Editar onClick={() => setEditarEn(8)} oscuro />
      </div>

      {calc && (
        <Seccion titulo="Mi ritmo para lograrlo" onEditar={() => setEditarEn(8)}>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Dato l="Llamadas al día" v={calc.dia.intentos} />
            <Dato l="Efectivos al día" v={calc.dia.efectivos} />
            <Dato l="Citas por semana" v={calc.semana.citas} />
            <Dato l="Cierres por mes" v={calc.mes.cierres} />
          </div>
        </Seccion>
      )}

      <Seccion titulo="Visión" onEditar={() => setEditarEn(2)}><p className="text-[15px] text-ink-950">{plan.vision}</p></Seccion>
      <Seccion titulo="Misión" onEditar={() => setEditarEn(3)}><p className="text-[15px] text-ink-950">{plan.mision}</p></Seccion>
      <Seccion titulo="Valores" onEditar={() => setEditarEn(4)}>
        <div className="flex flex-wrap gap-1.5">{plan.valores.map((v) => <span key={v} className="rounded-full bg-gray-100 px-3 py-1.5 text-sm font-semibold text-ink-950">{v}</span>)}</div>
      </Seccion>
      <Seccion titulo={`Metas ${plan.anio}`} onEditar={() => setEditarEn(7)}><ListaAreas valores={plan.metas} /></Seccion>
      <Seccion titulo={`Logros del ${plan.anio - 1}`} onEditar={() => setEditarEn(6)}><ListaAreas valores={plan.logros} /></Seccion>
      <Seccion titulo={`Clientes que pueden cerrar en ${plan.anio} · ${clientes.length}`} onEditar={() => setEditarEn(9)}>
        {clientes.length ? (
          <div className="grid gap-1 sm:grid-cols-2">{clientes.map((c) => <p key={c.id} className="truncate text-sm text-ink-950">• {c.nombre}</p>)}</div>
        ) : <p className="text-sm text-black/45">Aún no marcas clientes.</p>}
      </Seccion>

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
