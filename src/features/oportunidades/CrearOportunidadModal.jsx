import { useState } from "react";
import { Modal, Field, Button, inputClass, OpcionesBotones, SelectorContacto } from "../../components/ui/index.js";
import { TIPO_OP_LABEL } from "../../constants/oportunidades.js";
import { toLocalInput } from "../../lib/dates.js";

const OPCIONES_TIPO = Object.keys(TIPO_OP_LABEL).map((t) => ({ value: t, label: TIPO_OP_LABEL[t] }));

export function CrearOportunidadModal({ open, onClose, onCrear, contactos, oportunidadEditar, onGuardarEdicion }) {
  const editando = !!oportunidadEditar;
  const [cargado, setCargado] = useState(false);
  const [contactoId, setContactoId] = useState(contactos[0]?.id || "");
  const [tipo, setTipo] = useState("compra");
  const [valor, setValor] = useState("");
  const [zona, setZona] = useState("");
  const [proximaAccion, setProximaAccion] = useState("");
  const [proximaFecha, setProximaFecha] = useState("");

  if (open && !cargado) {
    if (oportunidadEditar) {
      setContactoId(oportunidadEditar.contactoId || "");
      setTipo(oportunidadEditar.tipo || "compra");
      setValor(oportunidadEditar.valor != null ? String(oportunidadEditar.valor) : "");
      setZona(oportunidadEditar.zona || "");
      setProximaAccion(oportunidadEditar.proximaAccion || "");
      setProximaFecha(toLocalInput(oportunidadEditar.proximaFecha));
    }
    setCargado(true);
  }
  if (!open && cargado) setCargado(false);

  function guardar() {
    if (!contactoId || !proximaAccion || !proximaFecha) return;
    const datos = { contactoId, tipo, valor: valor ? Number(valor) : null, zona, proximaAccion, proximaFecha: new Date(proximaFecha).toISOString() };
    if (editando) {
      onGuardarEdicion(oportunidadEditar.id, datos);
      onClose();
      return;
    }
    onCrear(datos);
    setValor(""); setZona(""); setProximaAccion(""); setProximaFecha("");
  }

  return (
    <Modal open={open} onClose={onClose} title={editando ? "Editar oportunidad" : "Nueva oportunidad"}>
      <div className="flex flex-col gap-4">
        <Field label="Contacto *">
          <SelectorContacto contactos={contactos} valor={contactoId} onChange={setContactoId} />
        </Field>
        <Field label="Tipo">
          <OpcionesBotones columnas={2} opciones={OPCIONES_TIPO} valor={tipo} onChange={setTipo} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Valor estimado (USD)"><input type="number" inputMode="decimal" className={inputClass} value={valor} onChange={(e) => setValor(e.target.value)} /></Field>
          <Field label="Zona"><input className={inputClass} value={zona} onChange={(e) => setZona(e.target.value)} /></Field>
        </div>
        <div className="rounded-xl bg-gray-100 p-3">
          <p className="mb-2 text-xs font-medium text-black/55">Toda oportunidad activa requiere próxima acción (regla de negocio)</p>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Próxima acción *"><input className={inputClass} value={proximaAccion} onChange={(e) => setProximaAccion(e.target.value)} placeholder="Ej. Llamar" /></Field>
            <Field label="Fecha *"><input type="datetime-local" className={inputClass} value={proximaFecha} onChange={(e) => setProximaFecha(e.target.value)} /></Field>
          </div>
        </div>
        <Button className="self-end" onClick={guardar} disabled={!contactoId || !proximaAccion || !proximaFecha}>
          {editando ? "Guardar cambios" : "Crear oportunidad"}
        </Button>
      </div>
    </Modal>
  );
}
