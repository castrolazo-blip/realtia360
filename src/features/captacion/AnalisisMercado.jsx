import { useState } from "react";
import { Card, Field, EmptyState } from "../../components/ui/index.js";
import { newId } from "../../lib/ids.js";
import { formatMoney } from "../../lib/format.js";
import { TIPO_INMUEBLE_LABEL, UNIDAD_TERRENO_LABEL, areaTerrenoEnVaras2 } from "../../constants/captacion.js";
import { BotonGrande } from "./wizard/BotonGrande.jsx";
import { TogglePill } from "./wizard/TogglePill.jsx";
import { calcularSimilitud, calcularAjustes } from "./acm.js";

export function AnalisisMercado({ open, onClose, captacion, onGuardar }) {
  const [comparables, setComparables] = useState([]);
  const [cargado, setCargado] = useState(false);

  if (open && !cargado) {
    setComparables((captacion.acm && captacion.acm.comparables) || []);
    setCargado(true);
  }
  if (!open) {
    if (cargado) setCargado(false);
    return null;
  }

  const c = captacion;
  const espacios = c.espacios || [];
  const espHab = espacios.find((e) => e.id === "habitaciones");
  const espBan = espacios.find((e) => e.id === "banos");
  const espEst = espacios.find((e) => e.id === "estacionamiento");
  const espAmen = espacios.find((e) => e.id === "amenidades");
  const subject = {
    habitaciones: espHab?.cantidad || 0,
    banos: espBan?.cantidad || 0,
    parqueos: espEst?.cantidad || 0,
    areaConstruccion: c.areaConstruccion || null,
    areaTerreno: areaTerrenoEnVaras2(c.areaTerreno, c.unidadTerreno || "varas2"), // normalizado a varas² para comparar contra comparables
    areaTerrenoDisplay: c.areaTerreno || null, // valor tal como lo capturó el asesor, en su unidad original
    unidadTerreno: c.unidadTerreno || "varas2",
    remodelada: !!c.remodelada,
    amueblada: !!c.amueblada,
    piscina: !!espAmen?.caracteristicas.some((x) => x.nombre === "Piscina"),
    seguridad: !!espAmen?.caracteristicas.some((x) => x.nombre === "Seguridad 24/7"),
  };

  const faltantes = [];
  if (!c.areaConstruccion) faltantes.push("área de construcción");
  if (!c.areaTerreno && c.tipoInmueble !== "apartamento") faltantes.push("área de terreno");
  if (c.antiguedad == null) faltantes.push("antigüedad");

  function agregarComparable() {
    setComparables((prev) => [...prev, { id: newId(), direccion: "", precio: "", areaTerreno: "", areaConstruccion: "", habitaciones: "", banos: "", parqueos: "", remodelada: false, amueblado: false, piscina: false, seguridad: false }]);
  }
  function actualizar(id, campo, valor) {
    setComparables((prev) => prev.map((cp) => (cp.id === id ? { ...cp, [campo]: valor } : cp)));
  }
  function eliminar(id) {
    setComparables((prev) => prev.filter((cp) => cp.id !== id));
  }

  const calculados = comparables
    .filter((cp) => Number(cp.precio) > 0)
    .map((cp) => {
      const compN = { ...cp, habitaciones: cp.habitaciones !== "" ? Number(cp.habitaciones) : null, banos: cp.banos !== "" ? Number(cp.banos) : null, parqueos: cp.parqueos !== "" ? Number(cp.parqueos) : null, areaTerreno: cp.areaTerreno !== "" ? Number(cp.areaTerreno) : null, areaConstruccion: cp.areaConstruccion !== "" ? Number(cp.areaConstruccion) : null, precio: Number(cp.precio) };
      const similitud = calcularSimilitud(subject, compN);
      const ajustes = calcularAjustes(subject, compN);
      const precioAjustado = compN.precio + ajustes.reduce((s, a) => s + a.monto, 0);
      return { ...cp, similitud, ajustes, precioAjustado };
    })
    .sort((a, b) => b.similitud - a.similitud);

  const promedio = calculados.length > 0 ? calculados.reduce((s, cp) => s + cp.precioAjustado, 0) / calculados.length : null;
  const ventaRapida = promedio ? Math.round((promedio * 0.95) / 500) * 500 : null;
  const recomendado = promedio ? Math.round(promedio / 500) * 500 : null;
  const aspiracional = promedio ? Math.round((promedio * 1.07) / 500) * 500 : null;

  function guardar() {
    onGuardar({ comparables });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-white">
      <div className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-3">
        <button onClick={onClose} className="text-sm font-medium text-black/40">✕ Cerrar</button>
        <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Análisis Comparativo de Mercado</p>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-5">
        {/* Resumen de la propiedad captada */}
        <div className="mb-5 rounded-2xl bg-indigo-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">Propiedad captada</p>
          <p className="mt-1 text-base font-bold text-gray-900">{TIPO_INMUEBLE_LABEL[c.tipoInmueble]} · {c.zona || c.direccion}</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-700">
            {subject.areaTerrenoDisplay && <span>{subject.areaTerrenoDisplay} {UNIDAD_TERRENO_LABEL[subject.unidadTerreno]} terreno</span>}
            {subject.areaConstruccion && <span>{subject.areaConstruccion} m² construcción</span>}
            <span>{subject.habitaciones} habitaciones</span>
            <span>{subject.banos} baños</span>
            {c.antiguedad != null && <span>{c.antiguedad} años</span>}
            {subject.parqueos > 0 && <span>{subject.parqueos} parqueos</span>}
            {subject.remodelada && <span>Remodelada</span>}
            {subject.amueblada && <span>Amueblada</span>}
          </div>
          <p className="mt-2 text-sm text-black/50">Precio actual de la captación: <span className="font-semibold text-gray-900">{formatMoney(c.precio)}</span></p>
        </div>

        {faltantes.length > 0 && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="text-sm text-amber-800">Para mejorar la precisión del ACM, falta confirmar: {faltantes.join(", ")}. Puedes completarlo editando la captación.</p>
          </div>
        )}

        {/* Comparables */}
        <h2 className="mb-3 text-base font-bold text-gray-900">Comparables</h2>
        <div className="mb-3 flex flex-col gap-3">
          {[...calculados, ...comparables.filter((cp) => !(Number(cp.precio) > 0))].map((cp) => (
            <Card key={cp.id} className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <input className="flex-1 rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5 text-sm font-semibold outline-none focus:border-indigo-600"
                  placeholder="Dirección del comparable" value={cp.direccion} onChange={(e) => actualizar(cp.id, "direccion", e.target.value)} />
                <button onClick={() => eliminar(cp.id)} className="shrink-0 rounded-full p-2 text-black/30 hover:bg-black/5">✕</button>
              </div>
              <Field label={cp.similitud != null ? "Precio" : "Precio *"}>
                <input type="number" className="mb-2 w-full rounded-xl border border-black/10 bg-gray-50 px-2.5 py-2 text-sm outline-none focus:border-indigo-600" value={cp.precio} onChange={(e) => actualizar(cp.id, "precio", e.target.value)} />
              </Field>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <Field label="V² terreno"><input type="number" className="w-full rounded-xl border border-black/10 bg-gray-50 px-2.5 py-2 text-sm outline-none focus:border-indigo-600" value={cp.areaTerreno} onChange={(e) => actualizar(cp.id, "areaTerreno", e.target.value)} /></Field>
                <Field label="m² constr."><input type="number" className="w-full rounded-xl border border-black/10 bg-gray-50 px-2.5 py-2 text-sm outline-none focus:border-indigo-600" value={cp.areaConstruccion} onChange={(e) => actualizar(cp.id, "areaConstruccion", e.target.value)} /></Field>
              </div>
              <div className="mb-2 grid grid-cols-2 gap-2">
                <Field label="Habitaciones"><input type="number" className="w-full rounded-xl border border-black/10 bg-gray-50 px-2.5 py-2 text-sm outline-none focus:border-indigo-600" value={cp.habitaciones} onChange={(e) => actualizar(cp.id, "habitaciones", e.target.value)} /></Field>
                <Field label="Baños"><input type="number" className="w-full rounded-xl border border-black/10 bg-gray-50 px-2.5 py-2 text-sm outline-none focus:border-indigo-600" value={cp.banos} onChange={(e) => actualizar(cp.id, "banos", e.target.value)} /></Field>
              </div>
              <div className="mb-3 w-1/2 pr-1">
                <Field label="Parqueos"><input type="number" className="w-full rounded-xl border border-black/10 bg-gray-50 px-2.5 py-2 text-sm outline-none focus:border-indigo-600" value={cp.parqueos} onChange={(e) => actualizar(cp.id, "parqueos", e.target.value)} /></Field>
              </div>

              {cp.similitud != null ? (
                <>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <TogglePill label="Remodelada" checked={cp.remodelada} onClick={() => actualizar(cp.id, "remodelada", !cp.remodelada)} />
                    <TogglePill label="Amueblado" checked={cp.amueblado} onClick={() => actualizar(cp.id, "amueblado", !cp.amueblado)} />
                    <TogglePill label="Piscina" checked={cp.piscina} onClick={() => actualizar(cp.id, "piscina", !cp.piscina)} />
                    <TogglePill label="Seguridad 24/7" checked={cp.seguridad} onClick={() => actualizar(cp.id, "seguridad", !cp.seguridad)} />
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cp.similitud >= 85 ? "bg-brand-100 text-brand-700" : cp.similitud >= 70 ? "bg-amber-100 text-amber-700" : "bg-gray-200 text-gray-600"}`}>
                        {cp.similitud}% similar
                      </span>
                      <span className="text-sm font-bold text-indigo-900">Ajustado: {formatMoney(cp.precioAjustado)}</span>
                    </div>
                    {cp.ajustes.length > 0 && (
                      <details className="mt-1">
                        <summary className="cursor-pointer text-xs font-medium text-indigo-700">Ver ajustes sugeridos ({cp.ajustes.length})</summary>
                        <div className="mt-1.5 flex flex-col gap-1">
                          {cp.ajustes.map((a, i) => (
                            <div key={i} className="flex items-center justify-between text-xs text-indigo-900">
                              <span>{a.motivo}</span>
                              <span className="font-semibold">{a.monto > 0 ? "+" : ""}{formatMoney(a.monto)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                </>
              ) : (
                <p className="mt-2 text-xs text-black/40">Ingresa el precio para calcular similitud y ajustes.</p>
              )}
            </Card>
          ))}
        </div>

        <button onClick={agregarComparable} className="mb-6 w-full rounded-2xl border-2 border-dashed border-indigo-200 py-3.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-50">
          + Agregar comparable
        </button>

        {/* Resultado */}
        {calculados.length > 0 ? (
          <div className="mb-6">
            <h2 className="mb-3 text-base font-bold text-gray-900">Resultado del ACM</h2>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-2xl border border-black/10 p-3 text-center">
                <p className="text-[11px] font-medium text-black/45">Venta rápida</p>
                <p className="mt-1 text-sm font-black text-gray-900">{formatMoney(ventaRapida)}</p>
              </div>
              <div className="rounded-2xl border-2 border-indigo-600 bg-indigo-50 p-3 text-center">
                <p className="text-[11px] font-medium text-indigo-700">Recomendado</p>
                <p className="mt-1 text-sm font-black text-indigo-900">{formatMoney(recomendado)}</p>
              </div>
              <div className="rounded-2xl border border-black/10 p-3 text-center">
                <p className="text-[11px] font-medium text-black/45">Aspiracional</p>
                <p className="mt-1 text-sm font-black text-gray-900">{formatMoney(aspiracional)}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600">
              De acuerdo con los {calculados.length} comparable(s) registrados y las características de la propiedad, se recomienda iniciar la comercialización entre{" "}
              <span className="font-semibold text-gray-900">{formatMoney(ventaRapida)}</span> y <span className="font-semibold text-gray-900">{formatMoney(aspiracional)}</span>.
            </p>
          </div>
        ) : (
          <EmptyState title="Agrega al menos un comparable con precio" hint="El análisis se calcula automáticamente en cuanto ingreses un precio." />
        )}
      </div>

      <div className="shrink-0 border-t border-black/5 bg-white p-4">
        <div className="mx-auto max-w-2xl">
          <BotonGrande variant="primary" onClick={guardar} className="w-full">Guardar análisis</BotonGrande>
        </div>
      </div>
    </div>
  );
}
