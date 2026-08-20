import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL, DISPONIBILIDAD_LABEL, DISPONIBILIDAD_TONE } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";
import { PropiedadDetalleModal } from "./PropiedadDetalleModal.jsx";

const FILTROS_OPERACION = [
  { value: "todas", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
];

// Espeja las carpetas de Drive de la oficina: Disponibles primero (lo que importa día a
// día), luego Reservadas / Cerradas / No disponibles como referencia histórica.
const FILTROS_DISPONIBILIDAD = [
  { value: "disponible", label: "Disponibles" },
  { value: "reservada", label: "Reservadas" },
  { value: "cerrada", label: "Cerradas" },
  { value: "no_disponible", label: "No disponibles" },
  { value: "todas", label: "Todas" },
];

export function Propiedades() {
  const { propiedadesOficina, nombreAgente, agency } = useAppData();
  const [filtro, setFiltro] = useState("todas");
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState("disponible");
  const [detalleId, setDetalleId] = useState(null);

  const visibles = useMemo(
    () =>
      propiedadesOficina
        .filter((p) => filtro === "todas" || p.operacion === filtro)
        .filter((p) => filtroDisponibilidad === "todas" || p.disponibilidad === filtroDisponibilidad),
    [propiedadesOficina, filtro, filtroDisponibilidad]
  );

  const seleccionada = propiedadesOficina.find((p) => p.id === detalleId);

  return (
    <div>
      <SectionHeader title="Propiedades" subtitle={`Inventario publicado de ${agency.nombreOficina} · ${propiedadesOficina.length}`} />

      <div className="mb-3 flex flex-wrap gap-2">
        {FILTROS_DISPONIBILIDAD.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltroDisponibilidad(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filtroDisponibilidad === f.value ? "bg-ink-950 text-white" : "bg-gray-100 text-black/55 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="mb-5 flex gap-2">
        {FILTROS_OPERACION.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              filtro === f.value ? "bg-brand-700 text-white" : "bg-white text-black/45 ring-1 ring-inset ring-black/10 hover:bg-gray-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          title="Sin propiedades en este filtro"
          hint="Cuando una captación llegue al estado Publicada, aparecerá acá para toda la oficina — no solo para quien la captó."
        />
      ) : (
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {visibles.map((p) => (
            <Card key={p.id} className="cursor-pointer overflow-hidden p-0 hover:border-black/15">
              <button className="block w-full text-left" onClick={() => setDetalleId(p.id)}>
                <div className="flex h-28 items-center justify-center bg-gradient-to-br from-ink-900 to-brand-900 text-white/30">
                  <Icon.Building className="h-9 w-9" />
                </div>
                <div className="p-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className="bg-brand-100 text-brand-700">{OPERACION_INMUEBLE_LABEL[p.operacion]}</Badge>
                    <Badge className={DISPONIBILIDAD_TONE[p.disponibilidad]}>{DISPONIBILIDAD_LABEL[p.disponibilidad]}</Badge>
                    <span className="text-xs text-black/40">{TIPO_INMUEBLE_LABEL[p.tipoInmueble]}</span>
                  </div>
                  <p className="mt-1.5 truncate text-sm font-semibold text-gray-900">{p.zona || p.direccion || "Sin ubicación"}</p>
                  <p className="text-base font-bold text-brand-700">{formatMoney(p.precio)}</p>
                  <p className="mt-1.5 truncate text-xs text-black/45">Asesor: {nombreAgente(p.agenteId)}</p>
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}

      <PropiedadDetalleModal propiedad={seleccionada} asesorNombre={seleccionada ? nombreAgente(seleccionada.agenteId) : ""} onClose={() => setDetalleId(null)} />
    </div>
  );
}
