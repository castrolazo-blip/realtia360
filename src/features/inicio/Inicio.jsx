import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, EmptyState } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { CIRCULO_EMOJI, CIRCULO_LABEL } from "../../constants/contactos.js";
import { ACCIONES_RAPIDAS } from "../../config/nav.js";
import { ActividadCard } from "../../components/shared/ActividadCard.jsx";
import { AccionModal } from "../../components/shared/AccionModal.jsx";
import { Confianza } from "./Confianza.jsx";
import { generarSugerencias } from "./sugerencias.js";

export function Inicio() {
  const {
    contactos, oportunidades, actividades, captaciones, contactoNombre, agency, signOut,
    completarActividad, reprogramarActividad, cancelarActividad, cargarDatosDemo,
    setVista, manejarAccionRapida, registrarContacto, abrirExpediente,
  } = useAppData();

  const [enFoco, setEnFoco] = useState(null);
  const [accion, setAccion] = useState(null);

  const { vencidas, deHoy, proximas } = useMemo(() => {
    const t0 = new Date(); t0.setHours(0, 0, 0, 0);
    const t1 = new Date(); t1.setHours(23, 59, 59, 999);
    const en7 = new Date(t1.getTime() + 7 * 86400000);
    const pendientes = actividades.filter((a) => a.estado === "pendiente");
    return {
      vencidas: pendientes.filter((a) => new Date(a.fechaHora) < t0).sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
      deHoy: pendientes.filter((a) => new Date(a.fechaHora) >= t0 && new Date(a.fechaHora) <= t1).sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
      proximas: pendientes.filter((a) => new Date(a.fechaHora) > t1 && new Date(a.fechaHora) <= en7).sort((a, b) => a.fechaHora.localeCompare(b.fechaHora)),
    };
  }, [actividades]);

  const sugerencias = useMemo(() => generarSugerencias(contactos), [contactos]);
  const alertas = oportunidades.filter((o) => o.estado === "activa" && (!o.proximaAccion || !o.proximaFecha));
  const captacionesIncompletas = (captaciones || []).filter((c) => c.estado !== "publicada" && c.checklist.some((it) => !it.completado));
  const todasHoyYVencidas = [...vencidas, ...deHoy];

  const irAOportunidades = () => setVista("oportunidades");
  const irACaptacion = () => setVista("captacion");

  return (
    <div>
      {/* Barra superior tipo ubicación — solo en móvil; en escritorio ya está la barra de búsqueda del sidebar */}
      <div className="flex items-center justify-between bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-1.5 text-gray-900">
          <Icon.Pin className="h-[1.125rem] w-[1.125rem] text-brand-700" />
          <div className="leading-tight">
            <p className="text-sm font-semibold">{agency.nombreOficina}, {agency.ubicacion}</p>
            <p className="text-xs text-black/40">Cartera de {agency.nombreAgente}</p>
          </div>
          <Icon.ChevronDown className="h-4 w-4 text-black/30" />
        </div>
        <div className="flex items-center gap-2">
          <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
            <Icon.Bell className="h-[1.125rem] w-[1.125rem] text-gray-600" />
            {alertas.length > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500" />}
          </button>
          <button onClick={signOut} title="Cerrar sesión" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-700 text-sm font-bold text-white">
            {agency.inicialAgente}
          </button>
        </div>
      </div>
      <div className="bg-white px-4 pb-4 lg:hidden">
        <div className="flex items-center gap-2 rounded-2xl border border-black/10 bg-gray-50 px-3.5 py-3">
          <Icon.Search className="h-[1.125rem] w-[1.125rem] text-black/35" />
          <span className="flex-1 text-sm text-black/35">Buscar contacto, oportunidad o zona</span>
          <Icon.Filter className="h-[1.125rem] w-[1.125rem] text-black/35" />
        </div>
      </div>

      {/* Fila de indicadores — solo en escritorio, estilo panel de control */}
      <div className="mb-8 hidden grid-cols-4 gap-4 lg:grid">
        <StatTile label="Pendientes hoy" valor={todasHoyYVencidas.length} icono={Icon.Clock} />
        <StatTile label="Oportunidades activas" valor={oportunidades.filter((o) => o.estado === "activa").length} icono={Icon.Target} />
        <StatTile label="Captaciones en proceso" valor={captaciones.length} icono={Icon.Clipboard} />
        <StatTile label="Sugerencias del círculo" valor={sugerencias.length} icono={Icon.Sparkle} destacado={sugerencias.length > 0} />
      </div>

      <div className="px-4 py-5 lg:px-0 lg:py-0">
        {/* Banner hero */}
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-ink-900 to-brand-900 p-6 text-white shadow-premium lg:p-8">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gold-400/10" />
          <div className="absolute -bottom-10 right-10 h-28 w-28 rounded-full bg-white/5" />
          <p className="relative font-display text-lg font-semibold leading-snug lg:text-2xl">
            {alertas.length > 0 ? `${alertas.length} oportunidad(es) sin próxima acción` : "Tu cartera está al día"}
          </p>
          <p className="relative mt-1 text-sm text-white/60">
            {alertas.length > 0 ? "Resuélvelo antes de que se te escape el negocio." : "Sigue así — cero pendientes críticos por ahora."}
          </p>
          <div className="relative mt-4 flex flex-wrap gap-2">
            <button onClick={irAOportunidades} className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-950">
              <Icon.Bolt className="h-4 w-4" /> Ver oportunidades
            </button>
            <button onClick={() => manejarAccionRapida("agenda")} className="inline-flex items-center gap-1.5 rounded-full border border-white/30 px-4 py-2 text-sm font-semibold text-white">
              <Icon.Calendar className="h-4 w-4" /> Agendar seguimiento
            </button>
          </div>
        </div>

        {contactos.length === 0 && (
          <div className="mb-6 flex flex-col items-start gap-3 rounded-3xl border border-dashed border-brand-200 bg-brand-50/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-base font-semibold text-ink-950">Tu cartera está vacía</p>
              <p className="mt-0.5 text-sm text-black/50">Crea tu primer contacto, o carga una cartera de ejemplo para explorar Realtia.</p>
            </div>
            <button onClick={cargarDatosDemo} className="shrink-0 rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
              Cargar datos de ejemplo
            </button>
          </div>
        )}

        {/* Sugerencias del Círculo de Influencia */}
        {sugerencias.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink-950">Sugerencias de tu Círculo</h2>
              <span className="text-xs font-medium text-brand-700">{sugerencias.length}</span>
            </div>
            <div className="flex flex-col gap-3 lg:grid lg:grid-cols-2 lg:items-start lg:gap-4">
              {sugerencias.slice(0, 4).map((s) => (
                <Card key={s.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gold-50 text-lg">{s.icono}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-800">{s.texto}</p>
                      {s.contacto?.notas?.[0] && (
                        <p className="mt-1.5 rounded-lg bg-gray-50 px-2.5 py-2 text-xs italic text-gray-500">💬 “{s.contacto.notas[0].texto}”</p>
                      )}
                    </div>
                  </div>
                  {s.contacto && (
                    <button
                      onClick={() => abrirExpediente(s.contacto.id)}
                      className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl border border-black/10 px-3 py-2.5 text-left hover:bg-gray-50"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                          {s.contacto.nombre.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{s.contacto.nombre}</p>
                          <p className="truncate text-[11px] text-black/40">
                            {CIRCULO_EMOJI[s.contacto.circulo]} {CIRCULO_LABEL[s.contacto.circulo]}
                          </p>
                        </div>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand-700">
                        Ver expediente <Icon.Chevron className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {captacionesIncompletas.length > 0 && (
          <button onClick={irACaptacion} className="mb-6 flex w-full items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-left hover:bg-orange-100">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                <Icon.Clipboard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-orange-700">{captacionesIncompletas.length} captación(es) con documentos pendientes</p>
                <p className="text-xs text-black/50">No se pueden publicar hasta completar el checklist.</p>
              </div>
            </div>
            <Icon.Chevron className="h-4 w-4 shrink-0 text-orange-400" />
          </button>
        )}

        {/* Acciones rápidas */}
        <div className="mb-6">
          <h2 className="mb-3 font-display text-base font-semibold text-ink-950">Acciones rápidas</h2>
          <div className="grid grid-cols-4 gap-3 lg:grid-cols-8">
            {ACCIONES_RAPIDAS.map((a) => (
              <button key={a.key} onClick={() => manejarAccionRapida(a.key)} className="flex flex-col items-center gap-2 rounded-2xl border border-black/5 bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.accent}`}>
                  <a.icon className="h-5 w-5" />
                </span>
                <span className="whitespace-pre-line text-[11px] font-medium leading-tight text-gray-700">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tu día / Próximos 7 días — una sola columna en móvil, panel dividido en escritorio */}
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
          <div className="mb-6 lg:mb-0">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink-950">Tu día</h2>
              <span className="text-xs font-medium text-brand-700">{todasHoyYVencidas.length} pendientes</span>
            </div>
            {todasHoyYVencidas.length === 0 ? (
              <EmptyState title="Nada urgente hoy" hint="Tus próximas actividades aparecerán aquí." />
            ) : (
              <div className="flex flex-col gap-3">
                {vencidas.map((a) => (
                  <ActividadCard key={a.id} a={a} contactoNombre={contactoNombre} urgente onAbrir={() => { setEnFoco(a); setAccion("completar"); }} onReprogramar={() => { setEnFoco(a); setAccion("reprogramar"); }} />
                ))}
                {deHoy.map((a) => (
                  <ActividadCard key={a.id} a={a} contactoNombre={contactoNombre} onAbrir={() => { setEnFoco(a); setAccion("completar"); }} onReprogramar={() => { setEnFoco(a); setAccion("reprogramar"); }} />
                ))}
              </div>
            )}
          </div>

          {proximas.length > 0 && (
            <div className="mb-6 lg:mb-0">
              <h2 className="mb-3 font-display text-base font-semibold text-ink-950">Próximos 7 días</h2>
              <div className="flex flex-col gap-3">
                {proximas.map((a) => (
                  <ActividadCard key={a.id} a={a} contactoNombre={contactoNombre} onAbrir={() => { setEnFoco(a); setAccion("completar"); }} onReprogramar={() => { setEnFoco(a); setAccion("reprogramar"); }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Franja de confianza */}
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:grid-cols-4">
          <Confianza icon={Icon.Shield} label="Reglas de negocio activas" />
          <Confianza icon={Icon.Check} label="Historial completo" />
          <Confianza icon={Icon.Sync} label="Datos siempre al día" />
          <Confianza icon={Icon.Clock} label="Próxima acción obligatoria" />
        </div>
      </div>

      <AccionModal
        actividad={enFoco} accion={accion} contacto={enFoco ? contactos.find((c) => c.id === enFoco.contactoId) : null}
        registrarContacto={registrarContacto} onAbrirContacto={abrirExpediente}
        onClose={() => { setEnFoco(null); setAccion(null); }}
        onCompletar={(r, s) => { completarActividad(enFoco.id, r, s); setEnFoco(null); setAccion(null); }}
        onReprogramar={(f) => { reprogramarActividad(enFoco.id, f); setEnFoco(null); setAccion(null); }}
        onCancelar={() => { cancelarActividad(enFoco.id); setEnFoco(null); setAccion(null); }}
      />
    </div>
  );
}

function StatTile({ label, valor, icono: IconComp, destacado }) {
  return (
    <Card className={`p-5 ${destacado ? "border-gold-300 bg-gold-50/40" : ""}`}>
      <div className="flex items-center justify-between">
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${destacado ? "bg-gold-500 text-ink-950" : "bg-brand-50 text-brand-700"}`}>
          <IconComp className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold text-ink-950">{valor}</p>
      <p className="mt-0.5 text-xs font-medium text-black/45">{label}</p>
    </Card>
  );
}
