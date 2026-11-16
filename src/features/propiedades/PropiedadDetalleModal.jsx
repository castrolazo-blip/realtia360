import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { SelectorContacto } from "../../components/ui/index.js";
import { GestorFotos } from "../../components/shared/GestorFotos.jsx";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL, DISPONIBILIDAD_LABEL, UNIDAD_TERRENO_LABEL } from "../../constants/captacion.js";
import { telHref, waHref } from "../../lib/contacts.js";
import { formatMoney } from "../../lib/format.js";
import { formatTelefono, normalizarTelefono } from "../../lib/telefono.js";
import { fechaLocal } from "../llamar/gestion.js";
import { tituloPropiedad, Precio, ImagenPropiedad, BotonCorazon, IconoPin } from "./ui.jsx";

const HORAS_VISITA = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const DIAS_VISITA = [[0, "Hoy"], [1, "Mañana"], [2, "En 2 días"], [3, "En 3 días"], [5, "En 5 días"], [7, "En 7 días"]];

// Ficha de una propiedad publicada, a pantalla completa como una app de propiedades: foto
// grande con galería, precio, características, descripción y el asesor responsable con
// WhatsApp y llamada. No muestra datos del propietario (son privados de quien la captó).
// Si la propiedad es del agente que la mira, puede administrar las fotos aquí mismo.
export function PropiedadDetalle({ propiedad: p, esFavorita, onFavorita, onClose }) {
  const { nombreAgente, telefonoAgente, agenteId, captaciones, contactos, crearActividad } = useAppData();
  const [fotoActiva, setFotoActiva] = useState(0);
  const [leerMas, setLeerMas] = useState(false);
  const [agendando, setAgendando] = useState(false);
  const [aviso, setAviso] = useState("");

  // La versión propia (si es mía) trae las fotos más recientes.
  const prop = captaciones.find((c) => c.id === p.id) || p;
  const fotos = prop.fotos || [];
  const esMia = prop.agenteId === agenteId;
  const asesor = nombreAgente(prop.agenteId);
  const telAsesor = telefonoAgente(prop.agenteId);
  const titulo = tituloPropiedad(prop);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);
  useEffect(() => { if (fotoActiva >= fotos.length) setFotoActiva(0); }, [fotos.length, fotoActiva]);
  useEffect(() => { if (!aviso) return; const t = setTimeout(() => setAviso(""), 2600); return () => clearTimeout(t); }, [aviso]);

  const espacios = prop.espacios || [];
  const cantidad = (id) => espacios.find((e) => e.id === id)?.cantidad;
  const caracteristicas = [
    cantidad("habitaciones") != null && { icono: "🛏️", texto: `${cantidad("habitaciones")} hab.` },
    cantidad("banos") != null && { icono: "🛁", texto: `${cantidad("banos")} ${cantidad("banos") === 1 ? "baño" : "baños"}` },
    prop.areaConstruccion && { icono: "📐", texto: `${Number(prop.areaConstruccion).toLocaleString("es-SV")} m²` },
    !prop.areaConstruccion && prop.areaTerreno && { icono: "📐", texto: `${Number(prop.areaTerreno).toLocaleString("es-SV")} ${UNIDAD_TERRENO_LABEL[prop.unidadTerreno] || ""}` },
    cantidad("estacionamiento") != null && { icono: "🚗", texto: `${cantidad("estacionamiento")} parqueo` },
  ].filter(Boolean).slice(0, 3);
  const amenidades = espacios.find((e) => e.id === "amenidades")?.caracteristicas || [];
  const descripcion = prop.descripcionIA || prop.notas || "";

  async function compartir() {
    const texto = `${titulo} · ${formatMoney(prop.precio)}${prop.operacion === "alquiler" ? "/mes" : ""}\n${prop.direccion || prop.zona || ""}\nAsesor: ${asesor}${telAsesor ? ` · ${telAsesor}` : ""}`;
    try {
      if (navigator.share) { await navigator.share({ title: titulo, text: texto }); return; }
      await navigator.clipboard.writeText(texto);
      setAviso("Datos copiados para compartir");
    } catch { /* el usuario canceló */ }
  }

  const fotosVisibles = fotos.slice(0, 5);
  const extra = fotos.length - fotosVisibles.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-center bg-ink-950/50 lg:items-center lg:p-6">
      <div className="relative h-full w-full max-w-lg overflow-y-auto bg-white lg:h-[92vh] lg:rounded-[2rem] lg:shadow-premium">
        {/* Foto principal */}
        <div className="relative">
          {fotos.length ? (
            <img src={fotos[fotoActiva]?.url} alt={titulo} onClick={() => setFotoActiva((fotoActiva + 1) % fotos.length)} className="h-[46vh] max-h-[420px] w-full cursor-pointer object-cover" />
          ) : (
            <ImagenPropiedad p={prop} className="h-[38vh] max-h-[360px] w-full" />
          )}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <button onClick={onClose} aria-label="Volver" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-xl font-bold text-ink-950 shadow">‹</button>
            <div className="flex gap-2">
              <button onClick={compartir} aria-label="Compartir" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" /></svg>
              </button>
              <BotonCorazon activo={esFavorita} onClick={onFavorita} className="!h-11 !w-11" />
            </div>
          </div>
        </div>

        {/* Galería: miniaturas sobre el borde de la foto */}
        {fotos.length > 1 && (
          <div className="relative z-10 mx-4 -mt-10 flex gap-2 rounded-2xl bg-white p-2 shadow-card">
            {fotosVisibles.map((f, i) => {
              const ultima = i === fotosVisibles.length - 1 && extra > 0;
              return (
                <button key={f.path} onClick={() => setFotoActiva(ultima && fotoActiva >= i ? (fotoActiva + 1) % fotos.length : i)} className={`relative aspect-square flex-1 overflow-hidden rounded-xl ${fotoActiva === i || (i === fotosVisibles.length - 1 && extra > 0 && fotoActiva > i) ? "ring-2 ring-ink-950" : ""}`}>
                  <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  {ultima && <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-bold text-white">+{extra}</span>}
                </button>
              );
            })}
          </div>
        )}

        <div className="px-5 pb-32 pt-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium text-black/55">{TIPO_INMUEBLE_LABEL[prop.tipoInmueble]} · {OPERACION_INMUEBLE_LABEL[prop.operacion]}</p>
            <Precio p={prop} className="shrink-0 text-xl" />
          </div>
          <h1 className="mt-1 text-[22px] font-bold leading-tight text-ink-950">{titulo}</h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-black/50"><IconoPin className="h-4 w-4" />{[prop.direccion, prop.zona].filter(Boolean).join(", ") || "Sin dirección"}</p>
          {prop.disponibilidad !== "disponible" && (
            <span className="mt-2 inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700">{DISPONIBILIDAD_LABEL[prop.disponibilidad]}</span>
          )}

          {caracteristicas.length > 0 && (
            <div className="mt-4 grid rounded-2xl border border-black/10 py-3.5" style={{ gridTemplateColumns: `repeat(${caracteristicas.length}, minmax(0, 1fr))` }}>
              {caracteristicas.map((c, i) => (
                <div key={i} className={`flex items-center justify-center gap-1.5 text-sm font-semibold text-ink-950 ${i ? "border-l border-black/10" : ""}`}>
                  <span>{c.icono}</span>{c.texto}
                </div>
              ))}
            </div>
          )}

          {descripcion && (
            <section className="mt-5">
              <h2 className="mb-1.5 text-lg font-bold text-ink-950">Descripción</h2>
              <p className={`whitespace-pre-line text-sm leading-relaxed text-black/55 ${leerMas ? "" : "line-clamp-4"}`}>{descripcion}</p>
              {descripcion.length > 220 && (
                <button onClick={() => setLeerMas((v) => !v)} className="mt-1 text-sm font-bold text-ink-950">{leerMas ? "Leer menos" : "Leer más…"}</button>
              )}
            </section>
          )}

          {amenidades.length > 0 && (
            <section className="mt-5">
              <h2 className="mb-2 text-lg font-bold text-ink-950">Amenidades</h2>
              <div className="flex flex-wrap gap-1.5">
                {amenidades.map((a, i) => (
                  <span key={i} className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-black/65">{a.tipo === "texto" ? `${a.nombre}: ${a.valor}` : a.nombre}</span>
                ))}
              </div>
            </section>
          )}

          <section className="mt-5">
            <h2 className="mb-2 text-lg font-bold text-ink-950">Asesor responsable</h2>
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-100 text-lg font-bold text-gold-700">{asesor.charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink-950">{asesor}{esMia ? " (tú)" : ""}</p>
                <p className="truncate text-xs text-black/45">{telAsesor ? formatTelefono(normalizarTelefono(telAsesor) || telAsesor) : "Sin teléfono registrado"}</p>
              </div>
              {telAsesor && !esMia && (
                <>
                  <a href={waHref(telAsesor, `Hola ${asesor.split(" ")[0]}, te escribo por ${titulo}.`)} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3zm0 2a7 7 0 1 1-3.6 13l-.3-.2-2.6.7.7-2.5-.2-.3A7 7 0 0 1 12 5zm-2.4 3.5c-.2 0-.5 0-.7.3-.2.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.8 2.8 4.4 3.8 2.2.8 2.6.7 3.1.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.3-1.6-.8c-.2-.1-.4-.1-.6.1l-.7.9c-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.4v-.4l-.8-1.8c-.1-.4-.4-.4-.5-.4z" /></svg>
                  </a>
                  <a href={telHref(telAsesor)} aria-label="Llamar" className="flex h-12 w-12 items-center justify-center rounded-full bg-ink-950 text-white">
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z" /></svg>
                  </a>
                </>
              )}
            </div>
          </section>

          {esMia && (
            <section className="mt-6 rounded-3xl bg-gray-50 p-4">
              <GestorFotos captacion={prop} />
            </section>
          )}
        </div>

        {aviso && <div className="fixed bottom-28 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-ink-950 px-4 py-2.5 text-sm font-semibold text-white shadow-premium">✓ {aviso}</div>}

        <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-white/0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6">
          <button onClick={() => setAgendando(true)} className="min-h-[58px] w-full rounded-full bg-ink-950 text-base font-semibold text-white shadow-premium">
            Agendar visita
          </button>
        </div>

        {agendando && (
          <AgendarVisita
            titulo={titulo} contactos={contactos} onClose={() => setAgendando(false)}
            onGuardar={async (datos) => {
              await crearActividad({ ...datos, oportunidadId: null, tipo: "visita", titulo: `Visita: ${titulo}`, estado: "pendiente", duracion: 60 });
              setAgendando(false);
              setAviso("Visita agendada en tu Agenda");
            }}
          />
        )}
      </div>
    </div>
  );
}

// Agendar una visita sin escribir: día y hora con botones; el comprador es opcional.
function AgendarVisita({ titulo, contactos, onClose, onGuardar }) {
  const [dia, setDia] = useState(null);
  const [hora, setHora] = useState("");
  const [contactoId, setContactoId] = useState("");
  const [guardando, setGuardando] = useState(false);
  const valida = dia != null && hora;

  async function guardar() {
    if (!valida || guardando) return;
    setGuardando(true);
    const [y, m, d] = fechaLocal(dia).split("-").map(Number);
    const [h, mi] = hora.split(":").map(Number);
    await onGuardar({ contactoId: contactoId || null, fechaHora: new Date(y, m - 1, d, h, mi).toISOString() });
    setGuardando(false);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink-950/50 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-5 sm:rounded-[2rem]" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-black/10" />
        <h2 className="text-xl font-bold text-ink-950">Agendar visita</h2>
        <p className="mb-4 text-sm text-black/50">{titulo}</p>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">¿Qué día?</p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {DIAS_VISITA.map(([n, l]) => (
            <button key={n} onClick={() => setDia(n)} className={`min-h-[52px] rounded-2xl border-2 text-sm font-semibold ${dia === n ? "border-ink-950 bg-ink-950 text-white" : "border-gray-200 text-gray-800"}`}>{l}</button>
          ))}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">¿A qué hora?</p>
        <div className="mb-4 grid grid-cols-3 gap-2">
          {HORAS_VISITA.map((h) => {
            const [a] = h.split(":").map(Number);
            return (
              <button key={h} onClick={() => setHora(h)} className={`min-h-[52px] rounded-2xl border-2 text-sm font-semibold ${hora === h ? "border-ink-950 bg-ink-950 text-white" : "border-gray-200 text-gray-800"}`}>
                {a % 12 || 12} {a >= 12 ? "pm" : "am"}
              </button>
            );
          })}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">¿Con qué cliente? (opcional)</p>
        <div className="mb-5">
          <SelectorContacto contactos={contactos} valor={contactoId} onChange={setContactoId} permitirNinguno etiquetaNinguno="Sin cliente por ahora" />
        </div>
        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <button onClick={onClose} className="min-h-[56px] rounded-full border-2 border-gray-200 text-sm font-semibold text-gray-700">Cancelar</button>
          <button onClick={guardar} disabled={!valida || guardando} className="min-h-[56px] rounded-full bg-ink-950 text-base font-semibold text-white disabled:opacity-40">
            {guardando ? "Guardando…" : "Agendar"}
          </button>
        </div>
      </div>
    </div>
  );
}
