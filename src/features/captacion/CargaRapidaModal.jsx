import { useState } from "react";
import { Modal, Field, Button, inputClass, OpcionesBotones, SelectorContacto } from "../../components/ui/index.js";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL, DISPONIBILIDAD_LABEL } from "../../constants/captacion.js";

const OPCIONES_TIPO = Object.keys(TIPO_INMUEBLE_LABEL).map((t) => ({ value: t, label: TIPO_INMUEBLE_LABEL[t] }));
const OPCIONES_OPERACION = Object.keys(OPERACION_INMUEBLE_LABEL).map((o) => ({ value: o, label: OPERACION_INMUEBLE_LABEL[o] }));
const OPCIONES_DISPONIBILIDAD = Object.keys(DISPONIBILIDAD_LABEL).map((d) => ({ value: d, label: DISPONIBILIDAD_LABEL[d] }));

// Para propiedades que ya existen de verdad — documentadas en las carpetas de Drive de la
// oficina — y no necesitan pasar por el wizard guiado de captación (Método DEC, espacios,
// ACM). Se registran directas con lo esencial y quedan publicadas de una vez.
export function CargaRapidaModal({ open, onClose, onCrear, contactos }) {
  const [contactoId, setContactoId] = useState("");
  const [tipoInmueble, setTipoInmueble] = useState("casa");
  const [operacion, setOperacion] = useState("venta");
  const [disponibilidad, setDisponibilidad] = useState("disponible");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [precio, setPrecio] = useState("");
  const [comisionPct, setComisionPct] = useState("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);

  function limpiar() {
    setContactoId(""); setTipoInmueble("casa"); setOperacion("venta"); setDisponibilidad("disponible");
    setDireccion(""); setZona(""); setPrecio(""); setComisionPct(""); setNotas("");
  }

  async function guardar() {
    if (!contactoId || !direccion) return;
    setGuardando(true);
    const res = await onCrear({
      contactoId, tipoInmueble, operacion, disponibilidad,
      direccion, zona: zona || null,
      precio: precio ? Number(precio) : null,
      comisionPct: comisionPct ? Number(comisionPct) : null,
      notas: notas || null,
    });
    setGuardando(false);
    if (res?.ok !== false) { limpiar(); onClose(); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Cargar propiedad existente">
      <div className="flex flex-col gap-4">
        <p className="rounded-xl bg-gray-100 p-3 text-xs text-black/55">
          Para propiedades que ya tenés documentadas fuera de Realtia (ej. en Drive). Se registran
          directo como publicadas, sin pasar por la captación guiada.
        </p>

        <Field label="Propietario *">
          <SelectorContacto contactos={contactos} valor={contactoId} onChange={setContactoId} />
        </Field>
        <Field label="Operación">
          <OpcionesBotones columnas={2} opciones={OPCIONES_OPERACION} valor={operacion} onChange={setOperacion} />
        </Field>
        <Field label="Tipo de inmueble">
          <OpcionesBotones columnas={3} opciones={OPCIONES_TIPO} valor={tipoInmueble} onChange={setTipoInmueble} />
        </Field>
        <Field label="Disponibilidad">
          <OpcionesBotones columnas={2} opciones={OPCIONES_DISPONIBILIDAD} valor={disponibilidad} onChange={setDisponibilidad} />
        </Field>
        <Field label="Dirección *">
          <input className={inputClass} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej. Res. Las Magnolias, casa #12" />
        </Field>
        <Field label="Zona">
          <input className={inputClass} value={zona} onChange={(e) => setZona(e.target.value)} placeholder="Ej. Santa Elena" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Precio (USD)"><input type="number" inputMode="decimal" className={inputClass} value={precio} onChange={(e) => setPrecio(e.target.value)} /></Field>
          <Field label="Comisión (%)"><input type="number" inputMode="decimal" className={inputClass} value={comisionPct} onChange={(e) => setComisionPct(e.target.value)} /></Field>
        </div>
        <Field label="Notas">
          <textarea className={inputClass} rows={2} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Lo que no encaje en los campos de arriba" />
        </Field>
        <Button className="self-end" onClick={guardar} disabled={!contactoId || !direccion || guardando}>
          {guardando ? "Guardando…" : "Publicar propiedad"}
        </Button>
      </div>
    </Modal>
  );
}
