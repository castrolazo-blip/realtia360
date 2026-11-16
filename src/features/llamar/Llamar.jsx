import { useEffect, useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Badge, EmptyState, inputClass } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import {
  RESULTADOS, PROXIMA_OPCIONES, HORAS_CITA, OBJETIVOS, OBJETIVO_LABEL,
  ESTADOS_GESTION, ESTADO_GESTION_LABEL, ESTADO_GESTION_TONE, RESULTADO_LABEL, METAS_DIA,
} from "../../constants/gestion.js";
import { armarCola, indicadoresGestion, fechaLocal } from "./gestion.js";
import { telHref, waHref } from "../../lib/contacts.js";
import { formatTelefono, normalizarTelefono } from "../../lib/telefono.js";
import { formatDia } from "../../lib/dates.js";

const nuevaLlamada = (contacto, actividadId) => ({
  contactoId: contacto.id,
  actividadId,
  canal: "llamada",
  resultado: "",
  resultadoTexto: "",
  otroEfectivo: true,
  nota: "",
  proxima: "",
  fechaCustom: "",
  cita: false,
  horaCita: "",
  estado: contacto.estadoGestion === "sin_gestion" ? "nuevo" : contacto.estadoGestion,
  objetivos: [...(contacto.objetivos || [])],
});

// Modo Llamar: una cola de prospección que se trabaja con botones. Llamas (o escribes por
// WhatsApp), tocas cómo salió, cuándo es la próxima y "Guardar y siguiente". La próxima
// llamada o cita queda agendada sola.
export function Llamar() {
  const { contactos, actividades, interacciones, registrarLlamada, llamarA, setLlamarA, setVista, setCrearContactoAbierto, setImportarAbierto } = useAppData();
  const [saltados, setSaltados] = useState(() => new Set());
  const [llamada, setLlamada] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [aviso, setAviso] = useState("");

  const cola = useMemo(() => armarCola(contactos, actividades, saltados), [contactos, actividades, saltados]);
  const hoy = useMemo(() => indicadoresGestion(interacciones), [interacciones]);

  const directo = llamarA && contactos.find((c) => c.id === llamarA);
  const turno = directo ? { contactoId: directo.id, actividadId: cola.find((x) => x.contactoId === directo.id)?.actividadId || null } : cola[0];
  const contacto = turno && contactos.find((c) => c.id === turno.contactoId);
  const posicion = turno ? cola.findIndex((x) => x.contactoId === turno.contactoId) : -1;

  useEffect(() => {
    if (contacto && (!llamada || llamada.contactoId !== contacto.id)) setLlamada(nuevaLlamada(contacto, turno.actividadId));
    if (!contacto && llamada) setLlamada(null);
  }, [contacto?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(""), 2600);
    return () => clearTimeout(t);
  }, [aviso]);

  const set = (cambios) => setLlamada((l) => ({ ...l, ...cambios }));
  const R = llamada && RESULTADOS.find((r) => r.key === llamada.resultado);
  const efectivo = R ? (R.key === "otro" ? llamada.otroEfectivo : R.efectivo) : false;

  function elegirResultado(r) {
    set({
      resultado: r.key,
      proxima: r.siguiente ? String(r.siguiente) : "none",
      fechaCustom: "",
      cita: false,
      horaCita: "",
      ...(r.estado ? { estado: r.estado } : {}),
    });
  }

  const fechaProxima = !llamada ? "" : llamada.proxima === "custom" ? llamada.fechaCustom : /^\d+$/.test(llamada.proxima) ? fechaLocal(Number(llamada.proxima)) : "";
  const valida = llamada && llamada.resultado
    && (llamada.resultado !== "otro" || llamada.resultadoTexto.trim().length >= 3)
    && (llamada.proxima !== "custom" || llamada.fechaCustom)
    && (!llamada.cita || (fechaProxima && llamada.horaCita));

  async function guardar() {
    if (!valida || guardando) return;
    setGuardando(true);
    const res = await registrarLlamada({
      contactoId: llamada.contactoId,
      actividadId: llamada.actividadId,
      canal: llamada.canal,
      resultado: llamada.resultado,
      resultadoTexto: llamada.resultado === "otro" ? llamada.resultadoTexto.trim() : "",
      efectivo,
      nota: llamada.nota,
      proximaFecha: llamada.estado === "no_contactar" ? "" : fechaProxima,
      cita: llamada.cita,
      horaCita: llamada.horaCita,
      estadoGestion: llamada.estado,
      objetivos: llamada.objetivos,
    });
    setGuardando(false);
    if (!res.ok) { setAviso("No se pudo guardar. Revisa tu conexión."); return; }
    setAviso(fechaProxima && llamada.estado !== "no_contactar" ? `${llamada.cita ? "Cita agendada" : "Próxima llamada"}: ${formatDia(`${fechaProxima}T12:00:00`)}` : "Llamada guardada");
    setLlamada(null);
    setLlamarA(null);
  }

  function saltar() {
    if (!contacto) return;
    setSaltados((s) => new Set([...s, contacto.id]));
    setLlamada(null);
    setLlamarA(null);
  }

  const kpis = (
    <div className="mb-4 grid grid-cols-3 gap-2">
      <Kpi label="Intentos hoy" valor={hoy.intentos} meta={METAS_DIA.intentos} />
      <Kpi label="Efectivos" valor={hoy.efectivos} meta={METAS_DIA.efectivos} />
      <Kpi label="Citas" valor={hoy.citas} meta={METAS_DIA.citas} />
    </div>
  );

  if (!contacto || !llamada) {
    return (
      <div>
        <h1 className="mb-4 font-display text-2xl font-semibold text-ink-950">Llamar</h1>
        {kpis}
        {aviso && <Aviso texto={aviso} />}
        <EmptyState title="No hay contactos en tu cola" hint="La cola toma tus llamadas vencidas, las de hoy y los contactos sin gestión registrada." />
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <BotonGrande onClick={() => setCrearContactoAbierto(true)} primario>+ Nuevo contacto</BotonGrande>
          <BotonGrande onClick={() => setImportarAbierto(true)}>Importar contactos</BotonGrande>
          {saltados.size > 0 && <BotonGrande onClick={() => setSaltados(new Set())}>Volver a mostrar {saltados.size} saltados</BotonGrande>}
        </div>
      </div>
    );
  }

  const actividad = llamada.actividadId && actividades.find((a) => a.id === llamada.actividadId);
  const ultima = interacciones.find((i) => i.contactoId === contacto.id);
  const motivo = actividad
    ? new Date(actividad.fechaHora) < new Date(new Date().setHours(0, 0, 0, 0)) ? `Llamada vencida desde ${formatDia(actividad.fechaHora)}` : "Llamada programada para hoy"
    : contacto.ultimaGestion ? `Última gestión: ${formatDia(contacto.ultimaGestion)}` : "Primera llamada a este contacto";
  const tel = normalizarTelefono(contacto.telefono) || contacto.telefono;

  return (
    <div className="pb-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-black/45">
        {posicion >= 0 ? `Cola de llamadas · ${posicion + 1} de ${cola.length}` : "Llamada directa"}
      </p>
      {kpis}
      {aviso && <Aviso texto={aviso} />}

      <div className="mb-5 rounded-3xl border-2 border-brand-700 bg-white p-5 shadow-card">
        <h1 className="font-display text-2xl font-semibold text-ink-950">{contacto.nombre}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge className={ESTADO_GESTION_TONE[contacto.estadoGestion]}>{ESTADO_GESTION_LABEL[contacto.estadoGestion]}</Badge>
          {(contacto.objetivos || []).map((o) => <Badge key={o}>{OBJETIVO_LABEL[o]}</Badge>)}
        </div>
        <p className="mt-2 text-sm text-black/55">
          {motivo}
          {ultima ? ` · último resultado: ${ultima.resultado === "otro" ? ultima.resultadoTexto : RESULTADO_LABEL[ultima.resultado]}` : ""}
        </p>
        {contacto.notas?.[0] && <p className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-sm italic text-gray-600">💬 “{contacto.notas[0].texto}”</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <a href={telHref(tel)} onClick={() => set({ canal: "llamada" })} className="flex min-h-[56px] items-center justify-center gap-1.5 whitespace-nowrap rounded-2xl bg-brand-700 px-2 text-[15px] font-semibold text-white">
            <Icon.Phone className="h-5 w-5 shrink-0" /> {formatTelefono(tel).replace("+503 ", "")}
          </a>
          <a href={waHref(tel)} target="_blank" rel="noopener noreferrer" onClick={() => set({ canal: "whatsapp" })} className="flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-[#1d8f4e] px-3 text-base font-semibold text-white">
            <Icon.Whatsapp className="h-5 w-5" /> WhatsApp
          </a>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[["llamada", "📞 Fue llamada"], ["whatsapp", "💬 Fue WhatsApp"]].map(([k, l]) => (
            <Opcion key={k} activo={llamada.canal === k} onClick={() => set({ canal: k })} compacto>{l}</Opcion>
          ))}
        </div>
      </div>

      <Paso numero="1" titulo="¿Cómo salió?" />
      <div className="mb-4 grid grid-cols-2 gap-2">
        {RESULTADOS.map((r) => (
          <button
            key={r.key}
            onClick={() => elegirResultado(r)}
            className={`min-h-[64px] rounded-2xl border-2 border-l-[12px] bg-white px-3 py-3 text-left text-[15px] font-semibold transition ${r.tone} ${
              llamada.resultado === r.key ? "border-ink-950 bg-gray-50 ring-1 ring-ink-950" : "border-gray-200"
            }`}
          >
            {r.label}
            {!r.efectivo && r.key !== "otro" && <span className="mt-0.5 block text-xs font-normal text-black/45">No cuenta como contacto efectivo</span>}
          </button>
        ))}
      </div>

      {llamada.resultado === "otro" && (
        <div className="mb-4 rounded-2xl border-2 border-sky-500 bg-white p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/45">Escribe el resultado</p>
          <input className={inputClass} placeholder="Ej.: Pidió información por correo" value={llamada.resultadoTexto} onChange={(e) => set({ resultadoTexto: e.target.value })} />
          <p className="mb-2 mt-3 text-xs font-semibold uppercase tracking-wide text-black/45">¿Hablaste con la persona?</p>
          <div className="grid grid-cols-2 gap-2">
            <Opcion activo={llamada.otroEfectivo} onClick={() => set({ otroEfectivo: true })}>Sí, hablamos</Opcion>
            <Opcion activo={!llamada.otroEfectivo} onClick={() => set({ otroEfectivo: false })}>No</Opcion>
          </div>
        </div>
      )}

      {R && (
        <>
          <Paso numero="2" titulo={llamada.cita ? "Fecha de la cita" : "Próxima llamada"} />
          {R.key === "interesado" && (
            <div className="mb-2">
              <Opcion activo={llamada.cita} onClick={() => set({ cita: !llamada.cita, proxima: llamada.proxima === "none" ? "3" : llamada.proxima })}>
                📅 Agendé una cita <span className="block text-xs font-normal text-black/45">La fecha que elijas será la cita</span>
              </Opcion>
            </div>
          )}
          <div className="mb-3 grid grid-cols-3 gap-2">
            {PROXIMA_OPCIONES.filter((o) => !(llamada.cita && o.value === "none")).map((o) => (
              <Opcion key={o.value} activo={llamada.proxima === o.value} onClick={() => set({ proxima: o.value, fechaCustom: o.value === "custom" ? llamada.fechaCustom : "" })} compacto>
                {o.label}
                {/^\d+$/.test(o.value) && <span className="block text-[11px] font-normal text-black/45">{formatDia(`${fechaLocal(Number(o.value))}T12:00:00`)}</span>}
              </Opcion>
            ))}
          </div>
          {llamada.proxima === "custom" && (
            <input type="date" className={`${inputClass} mb-3`} min={fechaLocal(0)} value={llamada.fechaCustom} onChange={(e) => set({ fechaCustom: e.target.value })} />
          )}
          {llamada.cita && (
            <>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/45">Hora de la cita</p>
              <div className="mb-4 grid grid-cols-4 gap-2">
                {HORAS_CITA.map((h) => (
                  <Opcion key={h} activo={llamada.horaCita === h} onClick={() => set({ horaCita: h })} compacto>{hora12(h)}</Opcion>
                ))}
              </div>
            </>
          )}

          {efectivo && (
            <>
              <p className="mb-2 mt-2 text-xs font-semibold uppercase tracking-wide text-black/45">¿Qué quiere hacer? (puedes marcar varios)</p>
              <div className="mb-4 grid grid-cols-2 gap-2">
                {OBJETIVOS.map((o) => (
                  <Opcion
                    key={o} compacto
                    activo={llamada.objetivos.includes(o)}
                    onClick={() => set({ objetivos: llamada.objetivos.includes(o) ? llamada.objetivos.filter((x) => x !== o) : [...llamada.objetivos, o] })}
                  >
                    {OBJETIVO_LABEL[o]}
                  </Opcion>
                ))}
              </div>
            </>
          )}

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/45">Estado del contacto</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {ESTADOS_GESTION.filter((e) => e !== "sin_gestion").map((e) => (
              <button
                key={e}
                onClick={() => set({ estado: e })}
                className={`min-h-[44px] rounded-full px-4 text-sm font-semibold transition ${llamada.estado === e ? "bg-ink-950 text-white" : "border border-black/10 bg-white text-black/60"}`}
              >
                {ESTADO_GESTION_LABEL[e]}
              </button>
            ))}
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/45">Comentario (opcional)</p>
          <textarea
            className={`${inputClass} mb-4`} rows={2} value={llamada.nota} onChange={(e) => set({ nota: e.target.value })}
            placeholder="Escribe o dicta con el micrófono del teclado lo que conversaron"
          />
        </>
      )}

      <div className="sticky bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 mt-2 grid grid-cols-[1fr_1fr_2fr] gap-2 rounded-3xl bg-white/95 p-2 shadow-premium backdrop-blur lg:bottom-4">
        <button onClick={() => { setLlamarA(null); setVista("inicio"); }} className="min-h-[56px] rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700">Salir</button>
        <button onClick={saltar} className="min-h-[56px] rounded-2xl border-2 border-gray-200 bg-white text-sm font-semibold text-gray-700">Saltar</button>
        <button onClick={guardar} disabled={!valida || guardando} className="min-h-[56px] rounded-2xl bg-ink-950 text-base font-semibold text-white disabled:opacity-40">
          {guardando ? "Guardando…" : "Guardar y siguiente"}
        </button>
      </div>
    </div>
  );
}

function hora12(h) {
  let [a, b] = h.split(":").map(Number);
  const ap = a >= 12 ? "pm" : "am";
  a = a % 12 || 12;
  return `${a}${b ? `:${String(b).padStart(2, "0")}` : ""} ${ap}`;
}

function Paso({ numero, titulo }) {
  return (
    <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-ink-950">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-950 text-sm font-bold text-gold-400">{numero}</span>
      {titulo}
    </h2>
  );
}

function Opcion({ activo, onClick, children, compacto }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border-2 text-center font-semibold transition ${compacto ? "min-h-[52px] px-2 py-2 text-sm" : "min-h-[60px] px-3 py-3 text-[15px]"} ${
        activo ? "border-ink-950 bg-gray-50 text-ink-950 ring-1 ring-ink-950" : "border-gray-200 bg-white text-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

function BotonGrande({ onClick, children, primario }) {
  return (
    <button onClick={onClick} className={`min-h-[56px] rounded-2xl px-4 text-base font-semibold ${primario ? "bg-brand-700 text-white" : "border-2 border-gray-200 bg-white text-gray-800"}`}>
      {children}
    </button>
  );
}

function Kpi({ label, valor, meta }) {
  const pct = meta ? Math.min(100, Math.round((valor / meta) * 100)) : 0;
  return (
    <div className="rounded-2xl border border-black/5 bg-white p-3 shadow-sm">
      <p className="text-[11px] font-medium text-black/45">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink-950">{valor}<span className="text-sm text-black/35"> / {meta}</span></p>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div className={`h-full rounded-full ${pct >= 100 ? "bg-brand-600" : pct >= 60 ? "bg-gold-500" : "bg-rose-400"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Aviso({ texto }) {
  return <div className="mb-4 rounded-2xl bg-ink-950 px-4 py-3 text-sm font-semibold text-white">✓ {texto}</div>;
}
