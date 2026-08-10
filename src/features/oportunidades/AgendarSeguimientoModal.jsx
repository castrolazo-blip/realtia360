import { useState } from "react";
import { Modal, Field, Button, inputClass } from "../../components/ui/index.js";
import { toLocalInput } from "../../lib/dates.js";

const manana = () => toLocalInput(new Date(Date.now() + 86400000).toISOString());

// Agenda el próximo seguimiento de una oportunidad como una actividad real (aparece en la
// Agenda), en vez de solo guardar un texto suelto. Se puede abrir después de cualquier
// actualización de la oportunidad (cambiar etapa, editar, etc.) — siempre está a mano.
export function AgendarSeguimientoModal({ open, onClose, tituloInicial, fechaInicial, onAgendar }) {
  const [cargado, setCargado] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [fecha, setFecha] = useState(manana());
  const [guardando, setGuardando] = useState(false);

  if (open && !cargado) {
    setTitulo(tituloInicial || "");
    setFecha(fechaInicial ? toLocalInput(fechaInicial) : manana());
    setCargado(true);
  }
  if (!open) {
    if (cargado) setCargado(false);
    return null;
  }

  async function guardar() {
    if (!titulo.trim() || !fecha) return;
    setGuardando(true);
    await onAgendar(titulo.trim(), new Date(fecha).toISOString());
    setGuardando(false);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title="Agendar seguimiento">
      <div className="flex flex-col gap-4">
        <Field label="¿Qué hay que hacer? *">
          <input className={inputClass} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Llamar para dar seguimiento" />
        </Field>
        <Field label="Fecha y hora *">
          <input type="datetime-local" className={inputClass} value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </Field>
        <p className="text-xs text-black/40">Quedará en tu Agenda y como próxima acción de esta oportunidad.</p>
        <Button className="self-end" onClick={guardar} disabled={!titulo.trim() || !fecha || guardando}>
          {guardando ? "Agendando…" : "Agendar"}
        </Button>
      </div>
    </Modal>
  );
}
