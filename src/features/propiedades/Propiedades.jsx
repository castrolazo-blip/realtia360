import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";
import { PropiedadDetalleModal } from "./PropiedadDetalleModal.jsx";

const FILTROS_OPERACION = [
  { value: "todas", label: "Todas" },
  { value: "venta", label: "Venta" },
  { value: "alquiler", label: "Alquiler" },
];

export function Propiedades() {
  const { propiedadesOficina, nombreAgente, agency } = useAppData();
  const [filtro, setFiltro] = useState("todas");
  const [detalleId, setDetalleId] = useState(null);

  const visibles = useMemo(
    () => (filtro === "todas" ? propiedadesOficina : propiedadesOficina.filter((p) => p.operacion === filtro)),
    [propiedadesOficina, filtro]
  );

  const seleccionada = propiedadesOficina.find((p) => p.id === detalleId);

  return (
    <div>
      <SectionHeader title="Propiedades" subtitle={`Inventario publicado de ${agency.nombreOficina} · ${propiedadesOficina.length}`} />

      <div className="mb-5 flex gap-2">
        {FILTROS_OPERACION.map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filtro === f.value ? "bg-ink-950 text-white" : "bg-gray-100 text-black/55 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          title="Sin propiedades publicadas"
          hint="Cuando una captación de Captación llegue al estado Publicada, aparecerá acá para toda la oficina — no solo para quien la captó."
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
                  <div className="flex items-center gap-2">
                    <Badge className="bg-brand-100 text-brand-700">{OPERACION_INMUEBLE_LABEL[p.operacion]}</Badge>
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
