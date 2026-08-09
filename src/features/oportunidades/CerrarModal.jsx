import { useState } from "react";
import { Modal, Field, Button, inputClass, OpcionesBotones } from "../../components/ui/index.js";

const OPCIONES_ESTADO = [
  { value: "ganada", label: "Ganada" },
  { value: "perdida", label: "Perdida" },
  { value: "pausada", label: "Pausada" },
];

export function CerrarModal({ id, onClose, onCerrar }) {
  const [estado, setEstado] = useState("ganada");
  const [motivo, setMotivo] = useState("");
  if (!id) return null;
  return (
    <Modal open onClose={onClose} title="Cerrar oportunidad">
      <div className="flex flex-col gap-4">
        <Field label="Resultado">
          <OpcionesBotones columnas={3} opciones={OPCIONES_ESTADO} valor={estado} onChange={setEstado} />
        </Field>
        <Field label="Motivo (obligatorio)"><textarea className={inputClass} rows={2} value={motivo} onChange={(e) => setMotivo(e.target.value)} /></Field>
        <Button className="self-end" disabled={!motivo} onClick={() => onCerrar(estado, motivo)}>Confirmar cierre</Button>
      </div>
    </Modal>
  );
}
