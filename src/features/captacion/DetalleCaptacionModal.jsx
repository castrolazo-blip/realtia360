import { useState } from "react";
import { Modal, Field, Badge, inputClass } from "../../components/ui/index.js";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL, ESTADOS_CAPTACION, ESTADO_CAPTACION_LABEL } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";
import { FichaPropiedad } from "./FichaPropiedad.jsx";
import { AnalisisMercado } from "./AnalisisMercado.jsx";

export function DetalleCaptacionModal({ id, captaciones, contactos, contactoNombre, onClose, onToggleChecklist, onCambiarEstado, onAbrirContacto, onGuardarACM }) {
  const [error, setError] = useState("");
  const [fichaAbierta, setFichaAbierta] = useState(false);
  const [acmAbierto, setAcmAbierto] = useState(false);
  const c = captaciones.find((x) => x.id === id);
  if (!id || !c) return null;

  const hechos = c.checklist.filter((it) => it.completado).length;
  const total = c.checklist.length;

  function avanzarEstado(nuevoEstado) {
    const res = onCambiarEstado(c.id, nuevoEstado);
    setError(res.ok ? "" : res.error);
  }

  return (
    <Modal open onClose={onClose} title={`${TIPO_INMUEBLE_LABEL[c.tipoInmueble]} · ${OPERACION_INMUEBLE_LABEL[c.operacion]}`}>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm font-semibold text-gray-900">{c.direccion}</p>
          <p className="text-xs text-black/45">{c.zona}</p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => setFichaAbierta(true)} className="flex flex-col items-center justify-center gap-1 rounded-xl bg-brand-700 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-brand-800">
            📄 Ficha
          </button>
          <button onClick={() => setAcmAbierto(true)} className="flex flex-col items-center justify-center gap-1 rounded-xl bg-indigo-700 px-3 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-800">
            📊 ACM
          </button>
        </div>

        <button
          onClick={() => { onClose(); onAbrirContacto(c.contactoId); }}
          className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2.5 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
              {contactoNombre(c.contactoId).charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{contactoNombre(c.contactoId)}</p>
              <p className="text-[11px] text-black/40">Propietario</p>
            </div>
          </div>
          <span className="text-xs font-medium text-brand-700">Ver expediente →</span>
        </button>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Precio</p>
            <p className="text-sm font-semibold text-gray-900">{formatMoney(c.precio)}</p>
          </div>
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Comisión</p>
            <p className="text-sm font-semibold text-gray-900">{c.comisionPct}%</p>
          </div>
        </div>

        <Field label="Estado">
          <select className={inputClass} value={c.estado} onChange={(e) => avanzarEstado(e.target.value)}>
            {ESTADOS_CAPTACION.map((e) => <option key={e} value={e}>{ESTADO_CAPTACION_LABEL[e]}</option>)}
          </select>
        </Field>
        {error && <p className="text-sm text-orange-700">⚠️ {error}</p>}

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-black/40">Checklist de documentos</h3>
            <span className="text-xs font-medium text-black/45">{hechos}/{total}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {c.checklist.map((it) => (
              <label key={it.id} className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5 text-sm text-gray-800">
                <input type="checkbox" checked={it.completado} onChange={() => onToggleChecklist(c.id, it.id)} />
                <span className={it.completado ? "text-black/40 line-through" : ""}>{it.nombre}</span>
              </label>
            ))}
          </div>
        </div>

        {c.notas && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-black/40">Notas</h3>
            <p className="text-sm text-gray-700">{c.notas}</p>
          </div>
        )}

        {c.espacios && c.espacios.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Espacios y características ({c.espacios.length})</h3>
            <div className="flex flex-col gap-2.5">
              {c.espacios.map((esp) => (
                <details key={esp.id} className="rounded-xl bg-amber-50 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-amber-900">
                    {esp.icono} {esp.nombre}{esp.cantidad != null ? ` · ${esp.cantidad}` : ""}
                  </summary>
                  {esp.contadores && esp.contadores.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {esp.contadores.map((ct, i) => (
                        <Badge key={i} className="bg-amber-200 text-amber-900">{ct.nombre}: {ct.valor}</Badge>
                      ))}
                    </div>
                  )}
                  {esp.contadores && esp.contadores.some((ct) => ct.unidades && ct.unidades.length > 0) && (
                    <div className="mt-2 flex flex-col gap-1.5">
                      {esp.contadores.filter((ct) => ct.unidades).flatMap((ct) => ct.unidades).map((u, i) => (
                        <div key={i} className="rounded-lg bg-white p-2">
                          <p className="text-xs font-semibold text-amber-900">{u.etiqueta}</p>
                          {u.caracteristicas.length === 0 ? (
                            <p className="text-[11px] text-amber-800/50">Sin características registradas</p>
                          ) : (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {u.caracteristicas.map((car, j) => (
                                <Badge key={j} className="bg-amber-50 text-amber-800">{car.tipo === "texto" ? `${car.nombre}: ${car.valor}` : car.nombre}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {esp.caracteristicas.length === 0 ? (
                    esp.contadores && esp.contadores.some((ct) => ct.unidades) ? null : (
                      <p className="mt-2 text-xs text-amber-800/60">Sin características adicionales registradas.</p>
                    )
                  ) : (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {esp.caracteristicas.map((car, i) => (
                        <Badge key={i} className="bg-white text-amber-800">{car.tipo === "texto" ? `${car.nombre}: ${car.valor}` : car.nombre}</Badge>
                      ))}
                    </div>
                  )}
                </details>
              ))}
            </div>
          </div>
        )}

        {c.diagnostico && c.diagnostico.some((p) => p.respuestas.length > 0) && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Diagnóstico · Método DEC</h3>
            <div className="flex flex-col gap-2.5">
              {c.diagnostico.filter((p) => p.respuestas.length > 0).map((p) => (
                <details key={p.pilar} className="rounded-xl bg-indigo-50 p-3">
                  <summary className="cursor-pointer text-sm font-semibold text-indigo-900">{p.titulo} ({p.respuestas.length})</summary>
                  <div className="mt-2 flex flex-col gap-2">
                    {p.respuestas.map((r, i) => (
                      <div key={i}>
                        <p className="text-xs font-medium text-indigo-900/70">{r.pregunta}</p>
                        <p className="text-sm text-indigo-900">{r.respuesta}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      <FichaPropiedad open={fichaAbierta} onClose={() => setFichaAbierta(false)} captacion={c} contacto={contactos.find((x) => x.id === c.contactoId)} />
      <AnalisisMercado open={acmAbierto} onClose={() => setAcmAbierto(false)} captacion={c} onGuardar={(datos) => onGuardarACM(c.id, datos)} />
    </Modal>
  );
}
