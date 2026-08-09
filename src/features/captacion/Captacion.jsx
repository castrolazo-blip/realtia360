import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, Button, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { ESTADOS_CAPTACION, ESTADO_CAPTACION_LABEL, ESTADO_CAPTACION_TONE, TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";
import { CaptacionGuiada } from "./CaptacionGuiada.jsx";
import { DetalleCaptacionModal } from "./DetalleCaptacionModal.jsx";

export function Captacion() {
  const { contactos, captaciones, contactoNombre, crearCaptacion, actualizarCaptacion, toggleChecklistCaptacion, cambiarEstadoCaptacion, abrirExpediente, guardarACM, guardarDescripcionIA } = useAppData();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [detalleId, setDetalleId] = useState(null);

  const columnas = ESTADOS_CAPTACION.map((estado) => ({ estado, items: captaciones.filter((c) => c.estado === estado) }));
  const incompletas = captaciones.filter((c) => c.estado !== "publicada" && c.checklist.some((it) => !it.completado));

  return (
    <div>
      <SectionHeader title="Captación de propiedades" subtitle={`${captaciones.length} en proceso`} action={<Button onClick={() => setCrearAbierto(true)}><Icon.Plus className="h-4 w-4" />Nueva</Button>} />

      {incompletas.length > 0 && (
        <Card className="mb-6 border-l-4 border-l-orange-600 !bg-orange-50 p-4">
          <p className="text-sm font-semibold text-orange-700">{incompletas.length} captación(es) con documentos pendientes</p>
          <p className="mt-0.5 text-xs text-black/55">No se pueden publicar hasta completar el checklist.</p>
        </Card>
      )}

      {captaciones.length === 0 ? (
        <EmptyState title="Sin captaciones" hint="Crea una desde un contacto propietario para empezar el expediente de su propiedad." />
      ) : (
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-6 lg:items-start">
          {columnas.map((col) => (
            <div key={col.estado}>
              <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-black/45">
                {ESTADO_CAPTACION_LABEL[col.estado]} <span className="text-black/30">{col.items.length}</span>
              </h2>
              <div className="flex flex-col gap-2.5">
                {col.items.map((c) => {
                  const hechos = c.checklist.filter((it) => it.completado).length;
                  const total = c.checklist.length;
                  return (
                    <Card key={c.id} className="cursor-pointer p-3.5 hover:border-black/15">
                      <button className="w-full text-left" onClick={() => setDetalleId(c.id)}>
                        <Badge className={ESTADO_CAPTACION_TONE[c.estado]}>{OPERACION_INMUEBLE_LABEL[c.operacion]}</Badge>
                        <p className="mt-1.5 text-sm font-semibold text-gray-900">{TIPO_INMUEBLE_LABEL[c.tipoInmueble]} · {c.zona || c.direccion}</p>
                        <p className="text-xs text-black/50">{contactoNombre(c.contactoId)} · {formatMoney(c.precio)}</p>
                        <div className="mt-2">
                          <div className="mb-1 flex items-center justify-between text-[11px] text-black/40">
                            <span>Checklist</span>
                            <span>{hechos}/{total}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className={`h-full rounded-full ${hechos === total ? "bg-brand-500" : "bg-orange-500"}`} style={{ width: `${(hechos / total) * 100}%` }} />
                          </div>
                        </div>
                      </button>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <CaptacionGuiada open={crearAbierto} onClose={() => setCrearAbierto(false)} contactos={contactos} onCrear={(d) => { crearCaptacion(d); setCrearAbierto(false); }} />
      <DetalleCaptacionModal
        id={detalleId} captaciones={captaciones} contactos={contactos} contactoNombre={contactoNombre}
        onClose={() => setDetalleId(null)} onToggleChecklist={toggleChecklistCaptacion} onCambiarEstado={cambiarEstadoCaptacion}
        onAbrirContacto={abrirExpediente} onGuardarACM={guardarACM} onGuardarDescripcionIA={guardarDescripcionIA} onGuardarEdicion={actualizarCaptacion}
      />
    </div>
  );
}
