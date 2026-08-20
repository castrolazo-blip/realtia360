import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Field, Button, inputClass, SectionHeader, PlanBadge } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";

export function Administracion() {
  const { agency, equipo, actualizarPerfil } = useAppData();
  const [nombreOficina, setNombreOficina] = useState(agency.nombreOficina);
  const [ubicacion, setUbicacion] = useState(agency.ubicacion);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    setGuardando(true);
    setError("");
    setGuardado(false);
    const res = await actualizarPerfil({ nombreAgente: agency.nombreAgente, telefono: agency.telefono, nombreOficina, ubicacion });
    setGuardando(false);
    if (res.ok) { setGuardado(true); setTimeout(() => setGuardado(false), 2000); }
    else setError(res.error || "No se pudo guardar.");
  }

  return (
    <div>
      <SectionHeader title="Administración" subtitle="Datos de la oficina" />

      <Card className="mb-6 p-5">
        <h2 className="mb-4 font-display text-base font-semibold text-ink-950">Perfil de la oficina</h2>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          <Field label="Nombre de la oficina"><input className={inputClass} value={nombreOficina} onChange={(e) => setNombreOficina(e.target.value)} /></Field>
          <Field label="Ubicación"><input className={inputClass} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} /></Field>
        </div>
        <p className="mt-2 text-xs text-black/40">
          Este es el nombre que un asesor debe escribir exacto (sin distinguir mayúsculas) al registrarse para unirse a tu oficina.
        </p>
        {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-black/45">Plan actual</span>
            <PlanBadge plan={agency.plan} />
          </div>
          <Button onClick={guardar} disabled={guardando}>{guardando ? "Guardando…" : guardado ? "¡Guardado!" : "Guardar"}</Button>
        </div>
      </Card>

      <Card className="mb-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold text-ink-950">Agentes de la oficina</h2>
          <span className="text-xs text-black/45">{equipo.length}</span>
        </div>
        <div className="flex flex-col gap-1.5">
          {equipo.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3.5 py-2.5">
              <span className="text-sm font-medium text-gray-900">{a.nombre_agente}</span>
              <span className="text-xs font-semibold uppercase tracking-wide text-black/40">{a.rol === "broker" ? "Broker" : "Asesor"}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex items-start gap-3 border-dashed p-5">
        <Icon.Bell className="h-5 w-5 shrink-0 text-black/30" />
        <div>
          <p className="text-sm font-semibold text-gray-900">Todavía no hay invitación por link o código</p>
          <p className="mt-0.5 text-xs text-black/50">
            Por ahora, un asesor se une escribiendo el mismo nombre de oficina exacto al registrarse — no hay
            control desde acá sobre quién entra. Es la próxima pieza pendiente de este módulo.
          </p>
        </div>
      </Card>
    </div>
  );
}
