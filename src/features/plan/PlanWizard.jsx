import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { inputClass } from "../../components/ui/index.js";
import { AREAS_VIDA, VALORES_SUGERIDOS, FRASES, METAS_MONETARIAS, COMISIONES_PROMEDIO, anioDelPlan } from "../../constants/plan.js";
import { calcularMetasPlan } from "./calculos.js";
import { formatMoney } from "../../lib/format.js";
import { normalizarTelefono } from "../../lib/telefono.js";

const PASOS = ["portada", "compromiso", "vision", "mision", "valores", "por_que", "logros", "metas", "negocio", "clientes", "firma"];

// Asistente del Plan de Negocio anual: la puerta de entrada de Realtia. Sigue el cuaderno
// de la oficina página por página. Guarda en cada paso, así se puede retomar donde quedó.
// Donde hay que escribir, ofrece frases para tocar y luego ajustar (o dictar por voz).
export function PlanWizard({ alTerminar, inicial }) {
  const { plan, guardarPlan, agency, contactos, crearContacto, signOut } = useAppData();
  const anio = plan?.anio || anioDelPlan();
  const [paso, setPaso] = useState(() => (inicial != null ? inicial : Math.min(plan?.paso || 0, PASOS.length - 1)));
  const [d, setD] = useState(() => ({
    vision: plan?.vision || "",
    mision: plan?.mision || "",
    valores: plan?.valores || [],
    porQue: plan?.porQue || "",
    logros: plan?.logros || {},
    metas: plan?.metas || {},
    metaMonetaria: plan?.metaMonetaria || null,
    comisionPromedio: plan?.comisionPromedio || null,
    clientesPotenciales: plan?.clientesPotenciales || [],
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
    clientes: true,
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
          {plan?.completadoEn ? (
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

          {clave === "clientes" && (
            <Clientes anio={anio} contactos={contactos} seleccion={d.clientesPotenciales} onChange={(c) => set({ clientesPotenciales: c })} crearContacto={crearContacto} />
          )}

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

function Clientes({ anio, contactos, seleccion, onChange, crearContacto }) {
  const [q, setQ] = useState("");
  const [nombre, setNombre] = useState("");
  const [tel, setTel] = useState("");
  const [agregando, setAgregando] = useState(false);
  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return contactos.filter((c) => !t || c.nombre.toLowerCase().includes(t)).sort((a, b) => Number(seleccion.includes(b.id)) - Number(seleccion.includes(a.id)));
  }, [contactos, q, seleccion]);
  const alternar = (id) => onChange(seleccion.includes(id) ? seleccion.filter((x) => x !== id) : [...seleccion, id]);

  async function agregar() {
    if (nombre.trim().length < 2 || agregando) return;
    setAgregando(true);
    const nuevo = await crearContacto({ nombre: nombre.trim(), telefono: normalizarTelefono(tel) || tel || null, clasificacion: "prospecto_futuro", estadoGestion: "nuevo", origen: "mis_contactos", ultimoContacto: null, notas: [] });
    setAgregando(false);
    if (nuevo) { onChange([...seleccion, nuevo.id]); setNombre(""); setTel(""); }
  }

  return (
    <Paso titulo="Clientes que pueden cerrar contigo" ayuda={`Toca todos los que pueden hacer negocio contigo en el ${anio}. Serán tu lista prioritaria en Llamar.`}>
      <p className="mb-3 text-sm font-bold text-ink-950">{seleccion.length} {seleccion.length === 1 ? "cliente marcado" : "clientes marcados"}</p>
      <div className="mb-4 rounded-2xl bg-gray-50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/45">Agregar uno nuevo</p>
        <div className="grid grid-cols-[1.3fr_1fr] gap-2">
          <input className={inputClass} placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <input className={inputClass} inputMode="tel" placeholder="Teléfono" value={tel} onChange={(e) => setTel(e.target.value)} />
        </div>
        <button onClick={agregar} disabled={nombre.trim().length < 2 || agregando} className="mt-2 min-h-[48px] w-full rounded-xl bg-ink-950 text-sm font-semibold text-white disabled:opacity-35">
          {agregando ? "Agregando…" : "+ Agregar a mi lista"}
        </button>
      </div>
      {contactos.length > 0 && (
        <>
          <input className={`${inputClass} mb-3`} placeholder="Buscar en mis contactos" value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="flex flex-col gap-2">
            {filtrados.slice(0, 80).map((c) => {
              const on = seleccion.includes(c.id);
              return (
                <button key={c.id} onClick={() => alternar(c.id)} className={`flex min-h-[56px] items-center gap-3 rounded-2xl border-2 px-3 text-left transition ${on ? "border-ink-950 bg-gray-50" : "border-gray-200 bg-white"}`}>
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${on ? "border-ink-950 bg-ink-950 text-white" : "border-black/20"}`}>{on ? "✓" : ""}</span>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink-950">{c.nombre}</span>
                </button>
              );
            })}
          </div>
        </>
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
        <Tarjeta titulo="Clientes que pueden cerrar"><p className="text-sm text-ink-950">{d.clientesPotenciales.length} en tu lista prioritaria</p></Tarjeta>
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
