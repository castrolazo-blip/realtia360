import { useState } from "react";
import { Modal, Field, Button, inputClass, OpcionesBotones } from "../../components/ui/index.js";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL, UNIDAD_TERRENO_LABEL } from "../../constants/captacion.js";

const OPCIONES_TIPO = Object.keys(TIPO_INMUEBLE_LABEL).map((t) => ({ value: t, label: TIPO_INMUEBLE_LABEL[t] }));
const OPCIONES_OPERACION = Object.keys(OPERACION_INMUEBLE_LABEL).map((o) => ({ value: o, label: OPERACION_INMUEBLE_LABEL[o] }));
const OPCIONES_UNIDAD = Object.keys(UNIDAD_TERRENO_LABEL).map((u) => ({ value: u, label: UNIDAD_TERRENO_LABEL[u] }));

// Edita los datos principales de una propiedad ya captada (tipo, dirección, precio,
// áreas, etc). Los espacios/características y el diagnóstico DEC se capturan una sola
// vez en el asistente guiado y no se tocan aquí — esta es la edición rápida de los
// datos que más cambian después de crear el expediente.
export function EditarCaptacionModal({ open, onClose, captacion, onGuardar }) {
  const [cargado, setCargado] = useState(false);
  const [tipoInmueble, setTipoInmueble] = useState("casa");
  const [operacion, setOperacion] = useState("venta");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [precio, setPrecio] = useState("");
  const [comisionPct, setComisionPct] = useState("");
  const [areaTerreno, setAreaTerreno] = useState("");
  const [unidadTerreno, setUnidadTerreno] = useState("varas2");
  const [areaConstruccion, setAreaConstruccion] = useState("");
  const [antiguedad, setAntiguedad] = useState("");
  const [remodelada, setRemodelada] = useState(false);
  const [amueblada, setAmueblada] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  if (open && !cargado && captacion) {
    setTipoInmueble(captacion.tipoInmueble || "casa");
    setOperacion(captacion.operacion || "venta");
    setDireccion(captacion.direccion || "");
    setZona(captacion.zona || "");
    setPrecio(captacion.precio != null ? String(captacion.precio) : "");
    setComisionPct(captacion.comisionPct != null ? String(captacion.comisionPct) : "");
    setAreaTerreno(captacion.areaTerreno != null ? String(captacion.areaTerreno) : "");
    setUnidadTerreno(captacion.unidadTerreno || "varas2");
    setAreaConstruccion(captacion.areaConstruccion != null ? String(captacion.areaConstruccion) : "");
    setAntiguedad(captacion.antiguedad != null ? String(captacion.antiguedad) : "");
    setRemodelada(!!captacion.remodelada);
    setAmueblada(!!captacion.amueblada);
    setError("");
    setCargado(true);
  }
  if (!open) {
    if (cargado) setCargado(false);
    return null;
  }

  async function guardar() {
    if (!direccion.trim()) return;
    setGuardando(true);
    setError("");
    const res = await onGuardar({
      tipoInmueble, operacion, direccion, zona,
      precio: precio ? Number(precio) : null,
      comisionPct: comisionPct ? Number(comisionPct) : 0,
      areaTerreno: areaTerreno ? Number(areaTerreno) : null,
      unidadTerreno,
      areaConstruccion: areaConstruccion ? Number(areaConstruccion) : null,
      antiguedad: antiguedad ? Number(antiguedad) : null,
      remodelada, amueblada,
    });
    setGuardando(false);
    if (res?.ok === false) setError(res.error || "No se pudieron guardar los cambios.");
    else onClose();
  }

  return (
    <Modal open onClose={onClose} title="Editar propiedad">
      <div className="flex flex-col gap-4">
        <Field label="Tipo de inmueble">
          <OpcionesBotones columnas={3} opciones={OPCIONES_TIPO} valor={tipoInmueble} onChange={setTipoInmueble} />
        </Field>
        <Field label="Operación">
          <OpcionesBotones columnas={2} opciones={OPCIONES_OPERACION} valor={operacion} onChange={setOperacion} />
        </Field>
        <Field label="Dirección *"><input className={inputClass} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej. Colonia Escalón, pasaje 3" /></Field>
        <Field label="Zona"><input className={inputClass} value={zona} onChange={(e) => setZona(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio (USD)"><input type="number" inputMode="decimal" className={inputClass} value={precio} onChange={(e) => setPrecio(e.target.value)} /></Field>
          <Field label="Comisión (%)"><input type="number" inputMode="decimal" className={inputClass} value={comisionPct} onChange={(e) => setComisionPct(e.target.value)} /></Field>
        </div>
        <Field label="Área de terreno">
          <div className="flex gap-2">
            <input type="number" inputMode="decimal" className={inputClass} value={areaTerreno} onChange={(e) => setAreaTerreno(e.target.value)} />
            <div className="flex shrink-0 overflow-hidden rounded-2xl border border-black/10">
              {OPCIONES_UNIDAD.map((u) => (
                <button
                  key={u.value} type="button" onClick={() => setUnidadTerreno(u.value)}
                  className={`px-3 text-sm font-semibold ${unidadTerreno === u.value ? "bg-brand-700 text-white" : "bg-white text-gray-500"}`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </Field>
        <Field label="Área de construcción (m²)"><input type="number" inputMode="decimal" className={inputClass} value={areaConstruccion} onChange={(e) => setAreaConstruccion(e.target.value)} /></Field>
        <Field label="Antigüedad (años)"><input type="number" inputMode="numeric" className={inputClass} value={antiguedad} onChange={(e) => setAntiguedad(e.target.value)} /></Field>
        <label className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3.5 py-3 text-sm text-gray-700">
          <input type="checkbox" checked={remodelada} onChange={(e) => setRemodelada(e.target.checked)} />
          La propiedad está remodelada
        </label>
        <label className="flex items-center gap-2.5 rounded-xl bg-gray-50 px-3.5 py-3 text-sm text-gray-700">
          <input type="checkbox" checked={amueblada} onChange={(e) => setAmueblada(e.target.checked)} />
          La propiedad está amueblada
        </label>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Button className="self-end" onClick={guardar} disabled={!direccion.trim() || guardando}>
          {guardando ? "Guardando…" : "Guardar cambios"}
        </Button>
      </div>
    </Modal>
  );
}
