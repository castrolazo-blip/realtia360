import { useState } from "react";
import { Modal, Field, Button, inputClass, OpcionesBotones, SelectorContacto } from "../../components/ui/index.js";
import { TIPO_ACT_LABEL, TIPOS_ACT } from "../../constants/actividades.js";
import { toLocalInput } from "../../lib/dates.js";

const OPCIONES_TIPO = TIPOS_ACT.map((t) => ({ value: t, label: TIPO_ACT_LABEL[t] }));

export function CrearActividadModal({ open, onClose, onCrear, contactos }) {
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState("llamada");
  const [contactoId, setContactoId] = useState("");
  const [fecha, setFecha] = useState(toLocalInput(new Date().toISOString()));

  function guardar() {
    if (!titulo) return;
    onCrear({ titulo, tipo, contactoId: contactoId || null, oportunidadId: null, fechaHora: new Date(fecha).toISOString(), duracion: 30 });
    setTitulo(""); setContactoId("");
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva actividad">
      <div className="flex flex-col gap-4">
        <Field label="Título *"><input className={inputClass} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Llamar para confirmar visita" /></Field>
        <Field label="Tipo">
          <OpcionesBotones columnas={2} opciones={OPCIONES_TIPO} valor={tipo} onChange={setTipo} />
        </Field>
        <Field label="Fecha y hora"><input type="datetime-local" className={inputClass} value={fecha} onChange={(e) => setFecha(e.target.value)} /></Field>
        <Field label="Contacto relacionado (opcional)">
          <SelectorContacto contactos={contactos} valor={contactoId} onChange={setContactoId} permitirNinguno etiquetaNinguno="Sin contacto" />
        </Field>
        <Button className="self-end" onClick={guardar} disabled={!titulo}>Crear actividad</Button>
      </div>
    </Modal>
  );
}
