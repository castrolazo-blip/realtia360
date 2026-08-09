import { useState } from "react";
import { Modal, Field, Button, inputClass } from "../../components/ui/index.js";
import { TIPO_ACT_LABEL, TIPOS_ACT } from "../../constants/actividades.js";
import { toLocalInput } from "../../lib/dates.js";

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
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo">
            <select className={inputClass} value={tipo} onChange={(e) => setTipo(e.target.value)}>
              {TIPOS_ACT.map((t) => <option key={t} value={t}>{TIPO_ACT_LABEL[t]}</option>)}
            </select>
          </Field>
          <Field label="Fecha y hora"><input type="datetime-local" className={inputClass} value={fecha} onChange={(e) => setFecha(e.target.value)} /></Field>
        </div>
        <Field label="Contacto relacionado (opcional)">
          <select className={inputClass} value={contactoId} onChange={(e) => setContactoId(e.target.value)}>
            <option value="">Sin contacto</option>
            {contactos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Field>
        <Button className="self-end" onClick={guardar} disabled={!titulo}>Crear actividad</Button>
      </div>
    </Modal>
  );
}
