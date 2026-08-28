import { useState } from "react";
import { Modal, Field, Button, inputClass, OpcionesBotones, SelectorContacto } from "../../components/ui/index.js";
import { TIPO_DOCUMENTO_LABEL, ORIGEN_FONDOS_LABEL, FORMA_PAGO_LABEL } from "../../constants/kyc.js";

const OPCIONES_TIPO_DOC = Object.keys(TIPO_DOCUMENTO_LABEL).map((t) => ({ value: t, label: TIPO_DOCUMENTO_LABEL[t] }));
const OPCIONES_ORIGEN = Object.keys(ORIGEN_FONDOS_LABEL).map((o) => ({ value: o, label: ORIGEN_FONDOS_LABEL[o] }));
const OPCIONES_PAGO = Object.keys(FORMA_PAGO_LABEL).map((f) => ({ value: f, label: FORMA_PAGO_LABEL[f] }));

export function CrearKycModal({ open, onClose, onCrear, contactos }) {
  const [contactoId, setContactoId] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState("dui");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [ocupacion, setOcupacion] = useState("");
  const [origenFondos, setOrigenFondos] = useState("");
  const [formaPago, setFormaPago] = useState("");
  const [montoTransaccion, setMontoTransaccion] = useState("");
  const [paisAltoRiesgo, setPaisAltoRiesgo] = useState(false);
  const [pep, setPep] = useState(false);
  const [guardando, setGuardando] = useState(false);

  function limpiar() {
    setContactoId(""); setTipoDocumento("dui"); setNumeroDocumento(""); setOcupacion("");
    setOrigenFondos(""); setFormaPago(""); setMontoTransaccion(""); setPaisAltoRiesgo(false); setPep(false);
  }

  async function guardar() {
    if (!contactoId) return;
    setGuardando(true);
    const res = await onCrear({
      contactoId, tipoDocumento, numeroDocumento: numeroDocumento || null, ocupacion: ocupacion || null,
      origenFondos: origenFondos || null, formaPago: formaPago || null,
      montoTransaccion: montoTransaccion ? Number(montoTransaccion) : null,
      paisAltoRiesgo, personaExpuestaPoliticamente: pep,
    });
    setGuardando(false);
    if (res?.ok !== false) { limpiar(); onClose(); }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo expediente KYC">
      <div className="flex flex-col gap-4">
        <Field label="Persona a verificar *">
          <SelectorContacto contactos={contactos} valor={contactoId} onChange={setContactoId} />
        </Field>
        <Field label="Tipo de documento">
          <OpcionesBotones columnas={3} opciones={OPCIONES_TIPO_DOC} valor={tipoDocumento} onChange={setTipoDocumento} />
        </Field>
        <Field label="Número de documento">
          <input className={inputClass} value={numeroDocumento} onChange={(e) => setNumeroDocumento(e.target.value)} />
        </Field>
        <Field label="Ocupación">
          <input className={inputClass} value={ocupacion} onChange={(e) => setOcupacion(e.target.value)} placeholder="Ej. Comerciante, empleado, empresario…" />
        </Field>
        <Field label="Origen de los fondos">
          <OpcionesBotones columnas={2} opciones={OPCIONES_ORIGEN} valor={origenFondos} onChange={setOrigenFondos} />
        </Field>
        <Field label="Forma de pago">
          <OpcionesBotones columnas={2} opciones={OPCIONES_PAGO} valor={formaPago} onChange={setFormaPago} />
        </Field>
        <Field label="Monto de la transacción (USD)">
          <input type="number" inputMode="decimal" className={inputClass} value={montoTransaccion} onChange={(e) => setMontoTransaccion(e.target.value)} />
        </Field>

        <div className="flex flex-col gap-2 rounded-xl bg-gray-100 p-3.5">
          <label className="flex items-center gap-2.5 text-sm text-gray-800">
            <input type="checkbox" checked={pep} onChange={(e) => setPep(e.target.checked)} />
            Es persona expuesta políticamente (PEP) o familiar/asociado cercano
          </label>
          <label className="flex items-center gap-2.5 text-sm text-gray-800">
            <input type="checkbox" checked={paisAltoRiesgo} onChange={(e) => setPaisAltoRiesgo(e.target.checked)} />
            Vínculo con un país de alto riesgo (según tu criterio)
          </label>
        </div>

        <Button className="self-end" onClick={guardar} disabled={!contactoId || guardando}>
          {guardando ? "Guardando…" : "Crear expediente"}
        </Button>
      </div>
    </Modal>
  );
}
