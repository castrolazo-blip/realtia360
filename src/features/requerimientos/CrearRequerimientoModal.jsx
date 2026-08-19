import { useState } from "react";
import { Modal, Field, Button, inputClass, OpcionesBotones, SelectorContacto } from "../../components/ui/index.js";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL } from "../../constants/captacion.js";

const OPCIONES_TIPO = [{ value: "", label: "Cualquiera" }, ...Object.keys(TIPO_INMUEBLE_LABEL).map((t) => ({ value: t, label: TIPO_INMUEBLE_LABEL[t] }))];
const OPCIONES_OPERACION = Object.keys(OPERACION_INMUEBLE_LABEL).map((o) => ({ value: o, label: OPERACION_INMUEBLE_LABEL[o] }));

export function CrearRequerimientoModal({ open, onClose, onCrear, contactos }) {
  const [contactoId, setContactoId] = useState("");
  const [tipoInmueble, setTipoInmueble] = useState("");
  const [operacion, setOperacion] = useState("venta");
  const [zona, setZona] = useState("");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [notas, setNotas] = useState("");

  function limpiar() {
    setContactoId(""); setTipoInmueble(""); setOperacion("venta"); setZona("");
    setPrecioMin(""); setPrecioMax(""); setNotas("");
  }

  function guardar() {
    if (!contactoId) return;
    onCrear({
      contactoId,
      tipoInmueble: tipoInmueble || null,
      operacion,
      zona: zona || null,
      precioMin: precioMin ? Number(precioMin) : null,
      precioMax: precioMax ? Number(precioMax) : null,
      notas: notas || null,
    });
    limpiar();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo requerimiento">
      <div className="flex flex-col gap-4">
        <Field label="Comprador *">
          <SelectorContacto contactos={contactos} valor={contactoId} onChange={setContactoId} />
        </Field>
        <Field label="Operación">
          <OpcionesBotones columnas={2} opciones={OPCIONES_OPERACION} valor={operacion} onChange={setOperacion} />
        </Field>
        <Field label="Tipo de inmueble">
          <OpcionesBotones columnas={3} opciones={OPCIONES_TIPO} valor={tipoInmueble} onChange={setTipoInmueble} />
        </Field>
        <Field label="Zona">
          <input className={inputClass} value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Ej. Santa Elena, San Benito…" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio mínimo (USD)"><input type="number" inputMode="decimal" className={inputClass} value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} /></Field>
          <Field label="Precio máximo (USD)"><input type="number" inputMode="decimal" className={inputClass} value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} /></Field>
        </div>
        <Field label="Notas">
          <textarea className={inputClass} rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Habitaciones, amenidades importantes, urgencia…" />
        </Field>
        <Button className="self-end" onClick={guardar} disabled={!contactoId}>Crear requerimiento</Button>
      </div>
    </Modal>
  );
}
