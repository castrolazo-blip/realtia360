import { useState } from "react";
import { Modal, Field, Button, inputClass } from "../../components/ui/index.js";

export function CerrarModal({ id, onClose, onCerrar }) {
  const [estado, setEstado] = useState("ganada");
  const [motivo, setMotivo] = useState("");
  if (!id) return null;
  return (
    <Modal open onClose={onClose} title="Cerrar oportunidad">
      <div className="flex flex-col gap-4">
        <Field label="Resultado">
          <select className={inputClass} value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="ganada">Ganada</option>
            <option value="perdida">Perdida</option>
            <option value="pausada">Pausada</option>
          </select>
        </Field>
        <Field label="Motivo (obligatorio)"><textarea className={inputClass} rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} /></Field>
        <Button className="self-end" disabled={!motivo} onClick={() => onCerrar(estado, motivo)}>Confirmar cierre</Button>
      </div>
    </Modal>
  );
}
