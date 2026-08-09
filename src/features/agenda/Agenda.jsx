import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Chip, EmptyState, SectionHeader, Button } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { DIAS_SEMANA_CORTO, MESES_LABEL } from "../../constants/calendario.js";
import { mismoDia, formatDia, sumarDias, sumarMeses, obtenerDiasCalendario } from "../../lib/dates.js";
import { ActividadCard } from "../../components/shared/ActividadCard.jsx";
import { AccionModal } from "../../components/shared/AccionModal.jsx";
import { CrearActividadModal } from "./CrearActividadModal.jsx";

export function Agenda() {
  const { contactos, actividades, contactoNombre, crearActividad, completarActividad, reprogramarActividad, cancelarActividad, registrarContacto, abrirExpediente } = useAppData();
  const [vista, setVista] = useState("lista"); // 'lista' | 'calendario'
  const [modoCal, setModoCal] = useState("mes"); // 'dia' | 'mes'
  const [fechaSel, setFechaSel] = useState(new Date());
  const [mesRef, setMesRef] = useState(new Date());
  const [estado, setEstado] = useState("pendiente");
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [enFoco, setEnFoco] = useState(null);
  const [accion, setAccion] = useState(null);

  const filtradas = actividades.filter((a) => a.estado === estado).sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  const grupos = useMemo(() => {
    const map = new Map();
    filtradas.forEach((a) => {
      const key = a.fechaHora.slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    });
    return Array.from(map.entries());
  }, [filtradas]);

  // Calendario: solo actividades que el asesor programó activamente (visitas, llamadas, reuniones, tareas…),
  // sin los toques de seguimiento del Círculo de Influencia (esos ya se gestionan desde el Inicio).
  const actividadesCalendario = actividades.filter((a) => a.tipo !== "seguimiento");
  const actividadesDelDia = actividadesCalendario.filter((a) => mismoDia(new Date(a.fechaHora), fechaSel)).sort((a, b) => a.fechaHora.localeCompare(b.fechaHora));
  const diasDelMes = useMemo(() => obtenerDiasCalendario(mesRef), [mesRef]);

  function abrirDia(fecha) {
    setFechaSel(fecha);
    setModoCal("dia");
  }

  return (
    <div>
      <SectionHeader title="Agenda" subtitle="Llamadas, visitas y tareas" action={<Button onClick={() => setCrearAbierto(true)}><Icon.Plus className="h-4 w-4" />Nueva</Button>} />

      <div className="mb-5 flex gap-1.5">
        <Chip activo={vista === "lista"} onClick={() => setVista("lista")}>Lista</Chip>
        <Chip activo={vista === "calendario"} onClick={() => setVista("calendario")}>📅 Calendario</Chip>
      </div>

      {vista === "lista" && (
        <>
          <div className="mb-5 flex gap-1.5">
            {["pendiente", "completada", "cancelada"].map((e) => (
              <button
                key={e}
                onClick={() => setEstado(e)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${estado === e ? "bg-brand-700 text-white" : "border border-black/10 bg-white text-black/55"}`}
              >
                {e === "pendiente" ? "Pendientes" : e === "completada" ? "Completadas" : "Canceladas"}
              </button>
            ))}
          </div>

          {grupos.length === 0 ? (
            <EmptyState title="No hay actividades aquí" hint="Crea llamadas, visitas o tareas y vincúlalas a un contacto." />
          ) : (
            <div className="lg:grid lg:grid-cols-2 lg:gap-6">
              {grupos.map(([dia, items]) => (
                <section key={dia} className="mb-7">
                  <h2 className="mb-2.5 text-sm font-semibold text-black/50">{formatDia(items[0].fechaHora)}</h2>
                  <div className="flex flex-col gap-2.5">
                    {items.map((a) => (
                      <ActividadCard
                        key={a.id} a={a} contactoNombre={contactoNombre}
                        onAbrir={() => { setEnFoco(a); setAccion("completar"); }}
                        onReprogramar={() => { setEnFoco(a); setAccion("reprogramar"); }}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </>
      )}

      {vista === "calendario" && (
        <>
          <div className="mb-5 flex gap-1.5">
            <Chip activo={modoCal === "dia"} onClick={() => setModoCal("dia")}>Día</Chip>
            <Chip activo={modoCal === "mes"} onClick={() => setModoCal("mes")}>Mes</Chip>
          </div>

          {modoCal === "dia" && (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <button onClick={() => setFechaSel((f) => sumarDias(f, -1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-bold text-gray-600">‹</button>
                <button onClick={() => setFechaSel(new Date())} className="text-center">
                  <p className="text-base font-bold capitalize text-gray-900">{formatDia(fechaSel.toISOString())}</p>
                  <p className="text-xs text-black/40">{fechaSel.toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })}</p>
                </button>
                <button onClick={() => setFechaSel((f) => sumarDias(f, 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-bold text-gray-600">›</button>
              </div>

              {actividadesDelDia.length === 0 ? (
                <EmptyState title="Sin actividades programadas" hint="No tienes visitas, llamadas ni tareas para este día." />
              ) : (
                <div className="flex flex-col gap-2.5">
                  {actividadesDelDia.map((a) => (
                    <ActividadCard
                      key={a.id} a={a} contactoNombre={contactoNombre}
                      onAbrir={() => { setEnFoco(a); setAccion("completar"); }}
                      onReprogramar={() => { setEnFoco(a); setAccion("reprogramar"); }}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {modoCal === "mes" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <button onClick={() => setMesRef((f) => sumarMeses(f, -1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-bold text-gray-600">‹</button>
                <p className="text-base font-bold capitalize text-gray-900">{MESES_LABEL[mesRef.getMonth()]} {mesRef.getFullYear()}</p>
                <button onClick={() => setMesRef((f) => sumarMeses(f, 1))} className="flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-lg font-bold text-gray-600">›</button>
              </div>

              <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
                {DIAS_SEMANA_CORTO.map((d, i) => <span key={i} className="text-xs font-semibold text-black/40">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasDelMes.map((dia, i) => {
                  const delMesActual = dia.getMonth() === mesRef.getMonth();
                  const actsDia = actividadesCalendario.filter((a) => mismoDia(new Date(a.fechaHora), dia));
                  const hoy = mismoDia(dia, new Date());
                  return (
                    <button
                      key={i} onClick={() => abrirDia(dia)}
                      className={`flex flex-col items-center gap-1 rounded-xl py-2 ${hoy ? "bg-brand-700 text-white" : delMesActual ? "bg-white text-gray-800" : "text-black/25"} ${!hoy ? "border border-black/5" : ""}`}
                    >
                      <span className="text-sm font-semibold">{dia.getDate()}</span>
                      <span className="flex h-1.5 gap-0.5">
                        {actsDia.slice(0, 3).map((a, j) => (
                          <span key={j} className={`h-1.5 w-1.5 rounded-full ${hoy ? "bg-white" : a.estado === "pendiente" ? "bg-brand-600" : "bg-gray-300"}`} />
                        ))}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-center text-xs text-black/40">Toca un día para ver sus actividades.</p>
            </div>
          )}
        </>
      )}

      <CrearActividadModal open={crearAbierto} onClose={() => setCrearAbierto(false)} contactos={contactos} onCrear={(d) => { crearActividad(d); setCrearAbierto(false); }} />
      <AccionModal
        actividad={enFoco} accion={accion} contacto={enFoco ? contactos.find((c) => c.id === enFoco.contactoId) : null}
        registrarContacto={registrarContacto} onAbrirContacto={abrirExpediente}
        onClose={() => { setEnFoco(null); setAccion(null); }}
        onCompletar={(r) => { completarActividad(enFoco.id, r, null); setEnFoco(null); setAccion(null); }}
        onReprogramar={(f) => { reprogramarActividad(enFoco.id, f); setEnFoco(null); setAccion(null); }}
        onCancelar={() => { cancelarActividad(enFoco.id); setEnFoco(null); setAccion(null); }}
      />
    </div>
  );
}
