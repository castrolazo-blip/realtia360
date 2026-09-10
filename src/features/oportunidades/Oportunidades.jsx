import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, Button, Chip, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { TIPO_OP_LABEL, ETAPA_LABEL, ETAPAS } from "../../constants/oportunidades.js";
import { formatMoney } from "../../lib/format.js";
import { CrearOportunidadModal } from "./CrearOportunidadModal.jsx";
import { CerrarModal } from "./CerrarModal.jsx";
import { DetalleOportunidadModal } from "./DetalleOportunidadModal.jsx";

export function Oportunidades() {
  const { contactos, oportunidades, contactoNombre, crearOportunidad, actualizarOportunidad, agendarSeguimientoOportunidad, cerrarOportunidad, abrirExpediente, abrirDocumentos } = useAppData();
  const [soloActivas, setSoloActivas] = useState(true);
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [cerrarObjetivo, setCerrarObjetivo] = useState(null);
  const [detalleId, setDetalleId] = useState(null);

  const visibles = oportunidades.filter((o) => !soloActivas || o.estado === "activa");
  const columnas = ETAPAS.map((etapa) => ({ etapa, items: visibles.filter((o) => o.etapa === etapa) }));

  return (
    <div>
      <SectionHeader title="Oportunidades" subtitle={`${oportunidades.length} en el embudo`} action={<Button onClick={() => setCrearAbierto(true)}><Icon.Plus className="h-4 w-4" />Nueva</Button>} />
      <div className="mb-5 flex gap-1.5">
        <Chip activo={soloActivas} onClick={() => setSoloActivas(true)}>Activas</Chip>
        <Chip activo={!soloActivas} onClick={() => setSoloActivas(false)}>Todas</Chip>
      </div>

      {visibles.length === 0 ? (
        <EmptyState title="Sin oportunidades" hint="Crea una desde un contacto con una necesidad concreta." />
      ) : (
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-5 lg:items-start">
          {columnas.filter((c) => !soloActivas || c.items.length > 0).map((col) => (
            <div key={col.etapa}>
              <h2 className="mb-2.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-black/45">
                {ETAPA_LABEL[col.etapa]} <span className="text-black/30">{col.items.length}</span>
              </h2>
              <div className="flex flex-col gap-2.5">
                {col.items.map((o) => (
                  <Card key={o.id} className={`cursor-pointer p-3.5 hover:border-black/15 ${(!o.proximaAccion || !o.proximaFecha) && o.estado === "activa" ? "border-l-4 border-l-rose-500" : ""}`}>
                    <button className="w-full text-left" onClick={() => setDetalleId(o.id)}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <Badge className="bg-brand-50 text-brand-700">{TIPO_OP_LABEL[o.tipo]}</Badge>
                        {o.estado !== "activa" && <Badge className={o.estado === "ganada" ? "bg-brand-100 text-brand-700" : "bg-black/5 text-black/60"}>{o.estado}</Badge>}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{contactoNombre(o.contactoId)}</p>
                      <p className="text-xs text-black/50">{formatMoney(o.valor)}</p>
                      {o.proximaAccion ? (
                        <p className="mt-2 text-xs text-black/55">→ {o.proximaAccion}</p>
                      ) : (
                        o.estado === "activa" && <p className="mt-2 text-xs font-medium text-rose-600">Sin próxima acción</p>
                      )}
                    </button>
                    {o.estado === "activa" && (
                      <Button variant="ghost" className="mt-2 !px-2 !py-1 text-xs" onClick={() => setCerrarObjetivo(o.id)}>
                        Cerrar…
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <CrearOportunidadModal open={crearAbierto} onClose={() => setCrearAbierto(false)} contactos={contactos} onCrear={(d) => { crearOportunidad(d); setCrearAbierto(false); }} />
      <CerrarModal id={cerrarObjetivo} onClose={() => setCerrarObjetivo(null)} onCerrar={(estado, motivo) => { cerrarOportunidad(cerrarObjetivo, estado, motivo); setCerrarObjetivo(null); }} />
      <DetalleOportunidadModal
        id={detalleId} oportunidades={oportunidades} contactos={contactos} contactoNombre={contactoNombre}
        onClose={() => setDetalleId(null)} onAbrirContacto={abrirExpediente} onAbrirDocumentos={abrirDocumentos} onActualizar={actualizarOportunidad} onCerrar={cerrarOportunidad}
        onAgendarSeguimiento={agendarSeguimientoOportunidad}
      />
    </div>
  );
}
