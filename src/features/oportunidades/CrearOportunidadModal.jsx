import { useState } from "react";
import { Modal, Field, Button, inputClass } from "../../components/ui/index.js";
import { TIPO_OP_LABEL } from "../../constants/oportunidades.js";

export function CrearOportunidadModal({ open, onClose, onCrear, contactos }) {
  const [contactoId, setContactoId] = useState(contactos[0]?.id || "");
  const [tipo, setTipo] = useState("compra");
  const [valor, setValor] = useState("");
  const [zona, setZona] = useState("");
  const [proximaAccion, setProximaAccion] = useState("");
  const [proximaFecha, setProximaFecha] = useState("");

  function guardar() {
    if (!contactoId || !proximaAccion || !proximaFecha) return;
    onCrear({ contactoId, tipo, valor: valor ? Number(valor) : null, zona, proximaAccion, proximaFecha: new Date(proximaFecha).toISOString() });
    setValor(""); setZona(""); setProximaAccion(""); setProximaFecha("");
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva oportunidad">
      <div className="flex flex-col gap-4">
        <Field label="Contacto *">
          <select className={inputClass} value={contactoId} onChange={(e) => setContactoId(e.target.value)}>
            {contactos.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Field>
        <Field label="Tipo">
          <select className={inputClass} value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {Object.keys(TIPO_OP_LABEL).map((t) => <option key={t} value={t}>{TIPO_OP_LABEL[t]}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor estimado (USD)"><input type="number" className={inputClass} value={valor} onChange={(e) => setValor(e.target.value)} /></Field>
          <Field label="Zona"><input className={inputClass} value={zona} onChange={(e) => setZona(e.target.value)} /></Field>
        </div>
        <div className="rounded-xl bg-gray-100 p-3">
          <p className="mb-2 text-xs font-medium text-black/55">Toda oportunidad activa requiere próxima acción (regla de negocio)</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Próxima acción *"><input className={inputClass} value={proximaAccion} onChange={(e) => setProximaAccion(e.target.value)} placeholder="Ej. Llamar" /></Field>
            <Field label="Fecha *"><input type="datetime-local" className={inputClass} value={proximaFecha} onChange={(e) => setProximaFecha(e.target.value)} /></Field>
          </div>
        </div>
        <Button className="self-end" onClick={guardar} disabled={!contactoId || !proximaAccion || !proximaFecha}>Crear oportunidad</Button>
      </div>
    </Modal>
  );
}
