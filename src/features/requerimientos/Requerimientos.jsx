import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, Button, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";
import { CrearRequerimientoModal } from "./CrearRequerimientoModal.jsx";
import { matchesParaRequerimiento } from "./matching.js";

const ESTADO_LABEL = { activo: "Activo", pausado: "Pausado", cerrado: "Cerrado" };
const ESTADO_TONE = { activo: "bg-brand-100 text-brand-700", pausado: "bg-gray-100 text-gray-600", cerrado: "bg-black/5 text-black/40" };

function rangoPrecio(min, max) {
  if (min == null && max == null) return "Sin rango definido";
  if (min != null && max != null) return `${formatMoney(min)} – ${formatMoney(max)}`;
  if (min != null) return `Desde ${formatMoney(min)}`;
  return `Hasta ${formatMoney(max)}`;
}

export function Requerimientos() {
  const { contactos, requerimientos, propiedadesOficina, nombreAgente, contactoNombre, crearRequerimiento, actualizarRequerimiento, abrirExpediente } = useAppData();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [expandidoId, setExpandidoId] = useState(null);

  return (
    <div>
      <SectionHeader
        title="Requerimientos"
        subtitle={`${requerimientos.length} · lo que están buscando tus compradores`}
        action={<Button onClick={() => setCrearAbierto(true)}><Icon.Plus className="h-4 w-4" />Nuevo</Button>}
      />

      {requerimientos.length === 0 ? (
        <EmptyState title="Sin requerimientos" hint="Registrá lo que busca un comprador para que Realtia lo compare automáticamente contra el inventario de la oficina." />
      ) : (
        <div className="flex flex-col gap-3">
          {requerimientos.map((r) => {
            const expandido = expandidoId === r.id;
            const matches = expandido ? matchesParaRequerimiento(r, propiedadesOficina) : [];
            const mejoresMatches = matches.filter((m) => m.porcentaje >= 60);
            return (
              <Card key={r.id} className="p-4">
                <button className="flex w-full items-start justify-between gap-3 text-left" onClick={() => setExpandidoId(expandido ? null : r.id)}>
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={ESTADO_TONE[r.estado]}>{ESTADO_LABEL[r.estado]}</Badge>
                      <span className="text-xs font-medium text-black/45">{OPERACION_INMUEBLE_LABEL[r.operacion]}{r.tipoInmueble ? ` · ${TIPO_INMUEBLE_LABEL[r.tipoInmueble]}` : ""}</span>
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-gray-900">{contactoNombre(r.contactoId)}</p>
                    <p className="text-xs text-black/50">{r.zona || "Cualquier zona"} · {rangoPrecio(r.precioMin, r.precioMax)}</p>
                  </div>
                  <Icon.ChevronDown className={`h-4 w-4 shrink-0 text-black/30 transition ${expandido ? "rotate-180" : ""}`} />
                </button>

                {expandido && (
                  <div className="mt-4 border-t border-black/5 pt-4">
                    {r.notas && <p className="mb-3 text-sm text-black/60">{r.notas}</p>}

                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-black/40">Coincidencias en el inventario de oficina</h3>
                      <span className="text-xs font-medium text-black/45">{propiedadesOficina.length} publicadas</span>
                    </div>

                    {propiedadesOficina.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-black/10 px-3 py-4 text-center text-xs text-black/40">
                        Todavía no hay propiedades publicadas en la oficina para comparar.
                      </p>
                    ) : mejoresMatches.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-black/10 px-3 py-4 text-center text-xs text-black/40">
                        Ninguna propiedad publicada coincide al menos un 60% con este requerimiento todavía.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {mejoresMatches.slice(0, 5).map(({ propiedad, porcentaje }) => (
                          <div key={propiedad.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">{TIPO_INMUEBLE_LABEL[propiedad.tipoInmueble]} · {propiedad.zona || propiedad.direccion}</p>
                              <p className="text-xs text-black/45">{formatMoney(propiedad.precio)} · {nombreAgente(propiedad.agenteId)}</p>
                            </div>
                            <Badge className={porcentaje >= 80 ? "bg-brand-600 text-white" : "bg-gold-100 text-gold-700"}>{porcentaje}% match</Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <button onClick={() => abrirExpediente(r.contactoId)} className="text-xs font-semibold text-brand-700">Ver expediente del comprador →</button>
                      {r.estado === "activo" ? (
                        <button onClick={() => actualizarRequerimiento(r.id, { estado: "cerrado" })} className="text-xs font-semibold text-black/40 hover:text-black/60">Marcar cerrado</button>
                      ) : (
                        <button onClick={() => actualizarRequerimiento(r.id, { estado: "activo" })} className="text-xs font-semibold text-brand-700">Reactivar</button>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <CrearRequerimientoModal open={crearAbierto} onClose={() => setCrearAbierto(false)} contactos={contactos} onCrear={(d) => { crearRequerimiento(d); setCrearAbierto(false); }} />
    </div>
  );
}
