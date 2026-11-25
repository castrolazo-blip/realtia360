import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { inputClass } from "../../components/ui/index.js";
import { AREAS_VIDA, VALORES_SUGERIDOS, FRASES, METAS_MONETARIAS, COMISIONES_PROMEDIO, anioDelPlan } from "../../constants/plan.js";
import { calcularMetasPlan } from "./calculos.js";
import { formatMoney } from "../../lib/format.js";
import {
  TIPOS_BLOQUE, OTRAS_SUGERIDAS, DIAS, DIAS_CORTO, ORDEN_SEMANA, INDICADORES, REVISION_MENSUAL, HORAS_REVISION, SEGUIMIENTO_DEFECTO,
  generarAgenda, bloquesDelDia, horasPorTipo, tituloBloque, hora12, aMin, deMin, choques, ordenar,
} from "./agenda.js";

export const PASOS = ["portada", "compromiso", "vision", "mision", "valores", "por_que", "logros", "metas", "negocio", "seguimiento", "agenda", "firma"];

// Asistente del Plan de Negocio anual: la puerta de entrada de Realtia. Sigue el cuaderno
// de la oficina página por página. Guarda en cada paso, así se puede retomar donde quedó.
// Donde hay que escribir, ofrece frases para tocar y luego ajustar (o dictar por voz).
export function PlanWizard({ alTerminar, inicial, cerrable }) {
  const { plan, guardarPlan, agency, signOut } = useAppData();
  const anio = plan?.anio || anioDelPlan();
  const [paso, setPaso] = useState(() => (inicial != null ? Math.max(0, PASOS.indexOf(inicial)) : Math.min(plan?.paso || 0, PASOS.length - 1)));
  const [d, setD] = useState(() => ({
    vision: plan?.vision || "",
    mision: plan?.mision || "",
    valores: plan?.valores || [],
    porQue: plan?.porQue || "",
    logros: plan?.logros || {},
    metas: plan?.metas || {},
    metaMonetaria: plan?.metaMonetaria || null,
    comisionPromedio: plan?.comisionPromedio || null,
    seguimiento: { ...SEGUIMIENTO_DEFECTO, ...(plan?.seguimiento || {}) },
    agenda: plan?.agenda?.bloques ? plan.agenda : null,
    compromisoEn: plan?.compromisoEn || null,
  }));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const set = (cambios) => setD((x) => ({ ...x, ...cambios }));
  const clave = PASOS[paso];

  useEffect(() => { window.scrollTo(0, 0); document.getElementById("plan-scroll")?.scrollTo(0, 0); }, [paso]);

  const valido = {
    portada: true,
    compromiso: !!d.compromisoEn,
    vision: d.vision.trim().length >= 10,
    mision: d.mision.trim().length >= 10,
    valores: d.valores.length >= 1,
    por_que: d.porQue.trim().length >= 5,
    logros: true,
    metas: (d.metas.negocio || "").trim().length >= 3,
    negocio: d.metaMonetaria > 0 && d.comisionPromedio > 0,
    seguimiento: d.seguimiento.dia != null && !!d.seguimiento.hora && d.seguimiento.indicadores.length > 0,
    agenda: (d.agenda?.bloques || []).length > 0,
    firma: true,
  }[clave];

  async function siguiente() {
    if (!valido || guardando) return;
    setGuardando(true); setError("");
    const ultimo = paso === PASOS.length - 1;
    const res = await guardarPlan({ ...d, anio, paso: ultimo ? paso : paso + 1, ...(ultimo ? { completadoEn: plan?.completadoEn || new Date().toISOString() } : {}) });
    setGuardando(false);
    if (!res.ok) { setError("No se pudo guardar. Revisa tu conexión e intenta de nuevo."); return; }
    if (ultimo) alTerminar?.();
    else setPaso(paso + 1);
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <div className="border-b border-black/5 px-5 pb-3 pt-[max(0.9rem,env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-xl items-center justify-between">
          <p className="text-sm font-bold text-ink-950">Plan de negocio {anio}</p>
          {plan?.completadoEn || cerrable ? (
            <button onClick={alTerminar} className="text-sm font-semibold text-black/50">Cerrar</button>
          ) : (
            <button onClick={signOut} className="text-xs font-semibold text-black/40">Salir</button>
          )}
        </div>
        <div className="mx-auto mt-2.5 flex max-w-xl gap-1">
          {PASOS.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= paso ? "bg-ink-950" : "bg-black/10"}`} />)}
        </div>
      </div>

      <div id="plan-scroll" className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-xl">
          {clave === "portada" && <Portada anio={anio} nombre={agency.nombreAgente} />}

          {clave === "compromiso" && (
            <Paso titulo="Mi compromiso">
              <p className="text-[19px] leading-relaxed text-ink-950">
                Yo, <b className="border-b-2 border-ink-950">{agency.nombreAgente}</b>, escribí este plan de negocio el{" "}
                <b className="border-b-2 border-ink-950">{new Date(d.compromisoEn || Date.now()).toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })}</b>.
                Me comprometo a mantener este plan de negocios en un lugar que lo vea todos los días y mantenerme enfocad@ en lograr mis metas.
              </p>
              <button
                onClick={() => set({ compromisoEn: d.compromisoEn ? null : new Date().toISOString() })}
                className={`mt-6 flex min-h-[64px] w-full items-center justify-center gap-2 rounded-2xl border-2 text-lg font-bold transition ${d.compromisoEn ? "border-ink-950 bg-ink-950 text-white" : "border-gray-200 text-ink-950"}`}
              >
                {d.compromisoEn ? "✓ Me comprometo" : "Tocar para comprometerme"}
              </button>
            </Paso>
          )}

          {clave === "vision" && (
            <Paso titulo="Visión" ayuda="¿Hacia dónde vas? Cómo te ves en unos años.">
              <TextoGuiado valor={d.vision} onChange={(v) => set({ vision: v })} frases={FRASES.vision} />
            </Paso>
          )}
          {clave === "mision" && (
            <Paso titulo="Misión" ayuda="¿Qué haces cada día y para quién?">
              <TextoGuiado valor={d.mision} onChange={(v) => set({ mision: v })} frases={FRASES.mision} />
            </Paso>
          )}

          {clave === "valores" && (
            <Paso titulo="Valores" ayuda="Toca los que te definen (los que quieras).">
              <div className="flex flex-wrap gap-2">
                {[...new Set([...VALORES_SUGERIDOS, ...d.valores])].map((v) => (
                  <button
                    key={v}
                    onClick={() => set({ valores: d.valores.includes(v) ? d.valores.filter((x) => x !== v) : [...d.valores, v] })}
                    className={`min-h-[48px] rounded-full px-4 text-[15px] font-semibold transition ${d.valores.includes(v) ? "bg-ink-950 text-white" : "border border-black/10 bg-white text-ink-950"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <OtroValor onAgregar={(v) => set({ valores: [...d.valores, v] })} />
            </Paso>
          )}

          {clave === "por_que" && (
            <Paso titulo='Mi "¿Por qué?"' ayuda="La razón que te va a levantar los días difíciles. Lo verás cada día al entrar.">
              <TextoGuiado valor={d.porQue} onChange={(v) => set({ porQue: v })} frases={FRASES.por_que} />
            </Paso>
          )}

          {clave === "logros" && (
            <Paso titulo={`Logros del ${anio - 1}`} ayuda="Recuerda las cosas buenas del año. Lo que no apliques, déjalo en blanco.">
              <Areas valores={d.logros} onChange={(logros) => set({ logros })} />
            </Paso>
          )}

          {clave === "metas" && (
            <Paso titulo={`Metas ${anio}`} ayuda="En todos los lados de tu vida. La de negocio es obligatoria.">
              <Areas valores={d.metas} onChange={(metas) => set({ metas })} requerida="negocio" />
            </Paso>
          )}

          {clave === "negocio" && <MetasNegocio d={d} set={set} anio={anio} />}

          {clave === "seguimiento" && <Seguimiento valor={d.seguimiento} onChange={(seguimiento) => set({ seguimiento })} />}

          {clave === "agenda" && <AgendaPlan d={d} set={set} />}

          {clave === "firma" && <Resumen d={d} anio={anio} nombre={agency.nombreAgente} />}

          {error && <p className="mt-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        </div>
      </div>

      <div className="border-t border-black/5 bg-white px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto grid max-w-xl grid-cols-[1fr_2fr] gap-2">
          <button onClick={() => setPaso(Math.max(0, paso - 1))} disabled={paso === 0} className="min-h-[56px] rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-700 disabled:opacity-30">
            Atrás
          </button>
          <button onClick={siguiente} disabled={!valido || guardando} className="min-h-[56px] rounded-full bg-ink-950 text-base font-semibold text-white disabled:opacity-35">
            {guardando ? "Guardando…" : clave === "portada" ? "Empezar mi plan" : clave === "firma" ? (plan?.completadoEn ? "Guardar cambios" : "Firmar y empezar") : "Siguiente"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Portada({ anio, nombre }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Hola, {nombre.split(" ")[0]}</p>
      <p className="mt-2 text-6xl font-extrabold tracking-tight text-ink-950">{anio}</p>
      <p className="mt-1 text-2xl font-semibold text-ink-950">Plan de negocio</p>
      <div className="mt-10 space-y-1 text-black/55">
        <p className="text-xs uppercase tracking-widest">Un</p>
        <p className="text-2xl font-extrabold text-ink-950">SUEÑO</p>
        <p className="text-xs uppercase tracking-widest">escrito se convierte en</p>
        <p className="text-2xl font-extrabold text-ink-950">META</p>
        <p className="text-xs uppercase tracking-widest">una meta con plan de acción es un</p>
        <p className="text-2xl font-extrabold text-ink-950">PLAN</p>
        <p className="text-xs uppercase tracking-widest">un plan con</p>
        <p className="text-2xl font-extrabold text-ink-950">ACCIÓN</p>
        <p className="text-xs uppercase tracking-widest">convierte tus sueños en tu</p>
        <p className="text-3xl font-extrabold text-brand-700">REALIDAD</p>
      </div>
      <p className="mt-8 max-w-sm text-sm text-black/50">Todo en Realtia parte de tu plan: tus metas del día, tu cola de llamadas y tu círculo virtuoso. Te toma unos 10 minutos.</p>
    </div>
  );
}

function Paso({ titulo, ayuda, children }) {
  return (
    <div>
      <h1 className="text-[28px] font-extrabold leading-tight text-ink-950">{titulo}</h1>
      {ayuda && <p className="mb-5 mt-1 text-[15px] text-black/50">{ayuda}</p>}
      {!ayuda && <div className="mb-5" />}
      {children}
    </div>
  );
}

function TextoGuiado({ valor, onChange, frases }) {
  return (
    <div>
      <textarea className={`${inputClass} min-h-[120px] text-[17px] leading-relaxed`} value={valor} onChange={(e) => onChange(e.target.value)} placeholder="Toca una frase de abajo o escribe / dicta con el micrófono del teclado" />
      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-black/40">Toca una idea para usarla y luego ajústala</p>
      <div className="flex flex-col gap-2">
        {frases.map((f) => (
          <button key={f} onClick={() => onChange(f)} className={`rounded-2xl border-2 px-4 py-3 text-left text-[15px] transition ${valor === f ? "border-ink-950 bg-gray-50" : "border-gray-200 bg-white text-black/70"}`}>
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

function OtroValor({ onAgregar }) {
  const [v, setV] = useState("");
  return (
    <div className="mt-4 flex gap-2">
      <input className={inputClass} placeholder="Otro valor" value={v} onChange={(e) => setV(e.target.value)} />
      <button onClick={() => { if (v.trim()) { onAgregar(v.trim()); setV(""); } }} className="shrink-0 rounded-xl bg-ink-950 px-4 text-sm font-semibold text-white">Agregar</button>
    </div>
  );
}

function Areas({ valores, onChange, requerida }) {
  return (
    <div className="flex flex-col gap-4">
      {AREAS_VIDA.map((a) => (
        <label key={a.key} className="block">
          <span className="mb-1.5 flex items-center gap-2 text-base font-bold text-ink-950">
            <span>{a.icono}</span>{a.label}{requerida === a.key && <span className="text-xs font-semibold text-rose-600">obligatoria</span>}
          </span>
          <textarea
            rows={2} className={`${inputClass} text-[16px]`} placeholder={a.ejemplo}
            value={valores[a.key] || ""} onChange={(e) => onChange({ ...valores, [a.key]: e.target.value })}
          />
        </label>
      ))}
    </div>
  );
}

function MontoBotones({ opciones, valor, onChange, etiqueta }) {
  const [otro, setOtro] = useState(valor && !opciones.includes(valor) ? String(valor) : "");
  return (
    <div className="mb-6">
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-950">{etiqueta}</p>
      <div className="grid grid-cols-3 gap-2">
        {opciones.map((o) => (
          <button key={o} onClick={() => { onChange(o); setOtro(""); }} className={`min-h-[56px] rounded-2xl border-2 text-[15px] font-bold transition ${valor === o ? "border-ink-950 bg-ink-950 text-white" : "border-gray-200 text-ink-950"}`}>
            {formatMoney(o)}
          </button>
        ))}
      </div>
      <input
        inputMode="numeric" className={`${inputClass} mt-2`} placeholder="Otro monto (US$)" value={otro}
        onChange={(e) => { const t = e.target.value.replace(/[^\d]/g, ""); setOtro(t); onChange(t ? Number(t) : null); }}
      />
    </div>
  );
}

function MetasNegocio({ d, set, anio }) {
  const calc = calcularMetasPlan(d);
  return (
    <Paso titulo="Metas de negocio" ayuda={`¿Cuántas transacciones necesito para lograr mis metas en el ${anio}?`}>
      <MontoBotones etiqueta="Meta monetaria (comisiones del año)" opciones={METAS_MONETARIAS} valor={d.metaMonetaria} onChange={(v) => set({ metaMonetaria: v })} />
      <MontoBotones etiqueta="Comisión promedio por transacción" opciones={COMISIONES_PROMEDIO} valor={d.comisionPromedio} onChange={(v) => set({ comisionPromedio: v })} />
      {calc && (
        <div className="rounded-3xl bg-ink-950 p-5 text-white">
          <p className="text-center text-sm text-white/60">{formatMoney(d.metaMonetaria)} ÷ {formatMoney(d.comisionPromedio)} =</p>
          <p className="text-center text-5xl font-extrabold">{calc.transacciones}</p>
          <p className="text-center text-sm font-semibold text-gold-400">transacciones en el {anio}</p>
          <table className="mt-5 w-full text-center text-sm">
            <thead><tr className="text-white/50"><th className="pb-2 text-left font-medium">Para lograrlo</th><th className="font-medium">Año</th><th className="font-medium">Mes</th><th className="font-medium">Semana</th><th className="font-medium">Día</th></tr></thead>
            <tbody className="font-semibold">
              {[["Cierres", "cierres"], ["Citas", "citas"], ["Contactos efectivos", "efectivos"], ["Llamadas", "intentos"]].map(([l, k]) => (
                <tr key={k} className="border-t border-white/10">
                  <td className="py-2 text-left text-white/80">{l}</td>
                  <td>{calc.anual[k]}</td><td>{calc.mes[k]}</td><td>{k === "cierres" ? "—" : calc.semana[k]}</td><td className="text-gold-400">{k === "cierres" || k === "citas" ? "—" : calc.dia[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-[11px] text-white/45">Basado en: 4 de cada 10 llamadas son contactos efectivos, 3 de cada 10 efectivos dan cita y 1 de cada 10 citas cierra.</p>
        </div>
      )}
    </Paso>
  );
}

function Resumen({ d, anio, nombre }) {
  const calc = calcularMetasPlan(d);
  return (
    <Paso titulo="Tu plan está listo" ayuda="Revísalo. Puedes cambiarlo cuando quieras desde Mi plan.">
      <div className="flex flex-col gap-3">
        <Tarjeta titulo='Mi "¿Por qué?"'><p className="text-[17px] font-semibold italic text-ink-950">“{d.porQue}”</p></Tarjeta>
        <Tarjeta titulo={`Meta ${anio}`}>
          <p className="text-3xl font-extrabold text-ink-950">{formatMoney(d.metaMonetaria)}</p>
          {calc && <p className="text-sm text-black/55">{calc.transacciones} transacciones · {calc.dia.intentos} llamadas al día · {calc.semana.citas} citas por semana</p>}
        </Tarjeta>
        <Tarjeta titulo="Valores"><p className="text-sm text-ink-950">{d.valores.join(" · ")}</p></Tarjeta>
        <Tarjeta titulo="Seguimiento">
          <p className="text-sm text-ink-950">Reviso mi plan cada {DIAS[d.seguimiento.dia].toLowerCase()} a las {hora12(d.seguimiento.hora)}{d.seguimiento.mensual !== "ninguna" ? ` · con mi broker: ${REVISION_MENSUAL[d.seguimiento.mensual].toLowerCase()}` : ""}</p>
        </Tarjeta>
        <Tarjeta titulo="Mi semana">
          <p className="text-sm text-ink-950">{(d.agenda?.bloques || []).length} bloques · {horasPorTipo(d.agenda?.bloques).slice(0, 3).map(([t, h]) => `${h} h ${(TIPOS_BLOQUE[t] || TIPOS_BLOQUE.otro).label.toLowerCase()}`).join(" · ")}</p>
        </Tarjeta>
      </div>
      <p className="mt-6 text-center text-sm text-black/50">Firmado por <b className="text-ink-950">{nombre}</b></p>
    </Paso>
  );
}

function Tarjeta({ titulo, children }) {
  return (
    <div className="rounded-3xl border border-black/[0.06] bg-white p-4 shadow-card">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-black/40">{titulo}</p>
      {children}
    </div>
  );
}

function Opcion({ activo, onClick, children, className = "" }) {
  return (
    <button onClick={onClick} className={`min-h-[52px] rounded-2xl border-2 px-2 text-[15px] font-semibold transition ${activo ? "border-ink-950 bg-ink-950 text-white" : "border-gray-200 text-ink-950"} ${className}`}>
      {children}
    </button>
  );
}

function Seguimiento({ valor, onChange }) {
  const set = (c) => onChange({ ...valor, ...c });
  return (
    <Paso titulo="¿Cómo le daré seguimiento?" ayuda="Un plan que no se revisa se olvida. Define cuándo lo revisas y qué vas a medir.">
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-950">Reviso mi plan cada semana el</p>
      <div className="mb-3 grid grid-cols-3 gap-2">
        {[1, 2, 3, 4, 5, 6].map((dd) => <Opcion key={dd} activo={valor.dia === dd} onClick={() => set({ dia: dd })}>{DIAS[dd]}</Opcion>)}
      </div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-950">A las</p>
      <div className="mb-6 grid grid-cols-3 gap-2">
        {HORAS_REVISION.map((h) => <Opcion key={h} activo={valor.hora === h} onClick={() => set({ hora: h })}>{hora12(h)}</Opcion>)}
      </div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-950">Revisión mensual con mi broker</p>
      <div className="mb-6 grid grid-cols-2 gap-2">
        {Object.entries(REVISION_MENSUAL).map(([k, l]) => <Opcion key={k} activo={valor.mensual === k} onClick={() => set({ mensual: k })}>{l}</Opcion>)}
      </div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-950">¿Qué voy a medir?</p>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(INDICADORES).map(([k, l]) => (
          <Opcion key={k} activo={valor.indicadores.includes(k)} onClick={() => set({ indicadores: valor.indicadores.includes(k) ? valor.indicadores.filter((x) => x !== k) : [...valor.indicadores, k] })}>
            {valor.indicadores.includes(k) ? "✓ " : ""}{l}
          </Opcion>
        ))}
      </div>
    </Paso>
  );
}

const DIAS_ATAJO = [["1,2,3,4,5", "Lunes a viernes"], ["1,2,3,4,5,6", "Lunes a sábado"]];

function AgendaPlan({ d, set }) {
  const calc = calcularMetasPlan(d);
  const llamadasDia = calc?.dia.intentos || 5;
  const [dias, setDias] = useState(d.agenda?.dias || [1, 2, 3, 4, 5]);
  const [inicio, setInicio] = useState(d.agenda?.inicio || "08:00");
  const [diaVer, setDiaVer] = useState(1);
  const [agregando, setAgregando] = useState(false);
  const bloques = d.agenda?.bloques || [];

  function armar(nDias = dias, nInicio = inicio) {
    const b = generarAgenda({ dias: nDias, inicio: nInicio, llamadasDia, revision: { dia: d.seguimiento.dia, hora: d.seguimiento.hora } });
    set({ agenda: { dias: nDias, inicio: nInicio, bloques: b } });
  }
  useEffect(() => { if (!bloques.length) armar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const guardarBloques = (nuevos) => set({ agenda: { dias, inicio, bloques: ordenar(nuevos) } });
  const delDia = bloquesDelDia(bloques, diaVer);
  const horas = horasPorTipo(bloques);
  const totalHoras = horas.reduce((s, [, h]) => s + h, 0);

  return (
    <Paso titulo="Así ordenaré mi agenda" ayuda={`Tu semana en bloques, armada con tu meta: ${llamadasDia} llamadas al día. Cada bloque es una cita contigo mismo.`}>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-950">Trabajo</p>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {DIAS_ATAJO.map(([v, l]) => {
          const arr = v.split(",").map(Number);
          return <Opcion key={v} activo={dias.join() === arr.join()} onClick={() => { setDias(arr); armar(arr, inicio); }}>{l}</Opcion>;
        })}
      </div>
      <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-950">Empiezo a las</p>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {["07:00", "08:00", "09:00"].map((h) => <Opcion key={h} activo={inicio === h} onClick={() => { setInicio(h); armar(dias, h); }}>{hora12(h)}</Opcion>)}
      </div>

      <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {ORDEN_SEMANA.map((dd) => (
          <button key={dd} onClick={() => setDiaVer(dd)} className={`min-w-[52px] rounded-2xl px-2 py-2 text-center text-sm font-semibold ${diaVer === dd ? "bg-ink-950 text-white" : "border border-black/10 text-ink-950"}`}>
            {DIAS_CORTO[dd]}<span className={`block text-[11px] font-normal ${diaVer === dd ? "text-white/60" : "text-black/40"}`}>{bloquesDelDia(bloques, dd).length}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {delDia.length === 0 && <p className="rounded-2xl bg-gray-50 p-4 text-center text-sm text-black/45">Día libre</p>}
        {delDia.map((b) => {
          const t = TIPOS_BLOQUE[b.tipo] || TIPOS_BLOQUE.otro;
          return (
            <div key={b.id} className="flex items-center gap-3 rounded-2xl border border-black/[0.06] bg-white p-3 shadow-sm" style={{ borderLeft: `6px solid ${t.color}` }}>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-black/45">{hora12(b.ini)} – {hora12(b.fin)}</p>
                <p className="truncate text-[15px] font-bold text-ink-950">{tituloBloque(b)}{b.meta ? ` · ${b.meta} llamadas` : ""}</p>
              </div>
              <button onClick={() => guardarBloques(bloques.filter((x) => x.id !== b.id))} className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 text-xs font-semibold text-black/55">Quitar</button>
            </div>
          );
        })}
      </div>
      {agregando ? (
        <NuevoBloque dia={diaVer} bloques={bloques} onCancelar={() => setAgregando(false)} onAgregar={(b) => { guardarBloques([...bloques, b]); setAgregando(false); }} />
      ) : (
        <button onClick={() => setAgregando(true)} className="mt-3 min-h-[52px] w-full rounded-2xl border-2 border-dashed border-black/15 text-sm font-semibold text-ink-950">+ Agregar bloque el {DIAS[diaVer].toLowerCase()}</button>
      )}

      <div className="mt-6 rounded-3xl bg-gray-50 p-4">
        <p className="mb-2 text-sm font-bold text-ink-950">Tu semana: {totalHoras} horas</p>
        {horas.map(([tipo, h]) => {
          const t = TIPOS_BLOQUE[tipo] || TIPOS_BLOQUE.otro;
          return (
            <div key={tipo} className="mb-1.5">
              <div className="flex justify-between text-xs text-black/60"><span>{t.label}</span><span>{h} h</span></div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/5"><div className="h-full rounded-full" style={{ width: `${(h / totalHoras) * 100}%`, background: t.color }} /></div>
            </div>
          );
        })}
        <button onClick={() => armar()} className="mt-3 text-xs font-semibold text-black/50 underline">Volver a la agenda sugerida</button>
      </div>
    </Paso>
  );
}

function NuevoBloque({ dia, bloques, onAgregar, onCancelar }) {
  const [tipo, setTipo] = useState("");
  const [nombre, setNombre] = useState("");
  const [ini, setIni] = useState("");
  const [dur, setDur] = useState(60);
  const horas = [];
  for (let m = 7 * 60; m <= 19 * 60; m += 30) horas.push(deMin(m));
  const candidato = ini ? { id: "nuevo", dia, ini, fin: deMin(aMin(ini) + dur), tipo, nombre } : null;
  const cruces = candidato ? choques(bloques, candidato) : [];
  const valido = tipo && ini && (tipo !== "otro" || nombre.trim().length >= 2);

  return (
    <div className="mt-3 rounded-3xl border-2 border-ink-950 bg-white p-4">
      <p className="mb-2 text-sm font-bold text-ink-950">Nuevo bloque · {DIAS[dia]}</p>
      <div className="mb-3 grid grid-cols-2 gap-2">
        {Object.entries(TIPOS_BLOQUE).filter(([k]) => k !== "revision").map(([k, t]) => (
          <button key={k} onClick={() => setTipo(k)} className={`min-h-[48px] rounded-xl border-2 px-2 text-left text-sm font-semibold ${tipo === k ? "border-ink-950 bg-gray-50" : "border-gray-200"}`} style={{ borderLeftWidth: 8, borderLeftColor: t.color }}>
            {t.label}
          </button>
        ))}
      </div>
      {tipo === "otro" && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {OTRAS_SUGERIDAS.map((o) => <button key={o} onClick={() => setNombre(o)} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${nombre === o ? "bg-ink-950 text-white" : "border border-black/10"}`}>{o}</button>)}
        </div>
      )}
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-black/45">Empieza</p>
      <div className="mb-3 grid grid-cols-4 gap-1.5">
        {horas.map((h) => <button key={h} onClick={() => setIni(h)} className={`min-h-[40px] rounded-xl text-xs font-semibold ${ini === h ? "bg-ink-950 text-white" : "border border-black/10"}`}>{hora12(h)}</button>)}
      </div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-black/45">Dura</p>
      <div className="mb-3 grid grid-cols-4 gap-1.5">
        {[[30, "30 min"], [60, "1 h"], [90, "1½ h"], [120, "2 h"], [180, "3 h"]].map(([m, l]) => <button key={m} onClick={() => setDur(m)} className={`min-h-[40px] rounded-xl text-xs font-semibold ${dur === m ? "bg-ink-950 text-white" : "border border-black/10"}`}>{l}</button>)}
      </div>
      {cruces.length > 0 && <p className="mb-3 rounded-xl bg-gold-50 p-2.5 text-xs text-gold-700">Se cruza con: {cruces.map((c) => `${tituloBloque(c)} (${hora12(c.ini)})`).join(", ")}</p>}
      <div className="grid grid-cols-[1fr_2fr] gap-2">
        <button onClick={onCancelar} className="min-h-[48px] rounded-full border-2 border-gray-200 text-sm font-semibold">Cancelar</button>
        <button disabled={!valido} onClick={() => onAgregar({ ...candidato, id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()), nombre: tipo === "otro" ? nombre.trim() : undefined })} className="min-h-[48px] rounded-full bg-ink-950 text-sm font-semibold text-white disabled:opacity-35">Agregar</button>
      </div>
    </div>
  );
}
