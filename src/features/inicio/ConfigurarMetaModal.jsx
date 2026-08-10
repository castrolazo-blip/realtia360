import { useState } from "react";
import { Modal, Field, Button, inputClass } from "../../components/ui/index.js";
import { useAppData } from "../../context/AppDataContext.jsx";

// Configura los tres supuestos que necesita Realtia Coach para calcular hacia atrás
// (meta → cierres → pipeline necesario). Se puede ajustar cuando cambien las condiciones
// del negocio del agente.
export function ConfigurarMetaModal({ open, onClose }) {
  const { agency, actualizarMeta } = useAppData();
  const [cargado, setCargado] = useState(false);
  const [metaAnual, setMetaAnual] = useState("");
  const [comisionPromedioPct, setComisionPromedioPct] = useState("");
  const [precioPromedioVenta, setPrecioPromedioVenta] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  if (open && !cargado) {
    setMetaAnual(agency.metaAnual ? String(agency.metaAnual) : "");
    setComisionPromedioPct(agency.comisionPromedioPct ? String(agency.comisionPromedioPct) : "");
    setPrecioPromedioVenta(agency.precioPromedioVenta ? String(agency.precioPromedioVenta) : "");
    setError("");
    setCargado(true);
  }
  if (!open) {
    if (cargado) setCargado(false);
    return null;
  }

  const valido = Number(metaAnual) > 0 && Number(comisionPromedioPct) > 0 && Number(precioPromedioVenta) > 0;

  async function guardar() {
    if (!valido) return;
    setGuardando(true);
    setError("");
    const res = await actualizarMeta({
      metaAnual: Number(metaAnual),
      comisionPromedioPct: Number(comisionPromedioPct),
      precioPromedioVenta: Number(precioPromedioVenta),
    });
    setGuardando(false);
    if (res.ok) onClose();
    else setError(res.error || "No se pudo guardar la meta.");
  }

  return (
    <Modal open onClose={onClose} title="Configura tu meta">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-black/55">
          Con estos tres datos, Realtia calcula cuántos cierres necesitás este año y qué tan cerca estás según tu embudo actual.
        </p>
        <Field label="Meta de ingresos este año (USD) *">
          <input type="number" inputMode="decimal" className={inputClass} value={metaAnual} onChange={(e) => setMetaAnual(e.target.value)} placeholder="Ej. 80000" />
        </Field>
        <Field label="Comisión promedio que ganás por venta (%) *">
          <input type="number" inputMode="decimal" className={inputClass} value={comisionPromedioPct} onChange={(e) => setComisionPromedioPct(e.target.value)} placeholder="Ej. 5" />
        </Field>
        <Field label="Precio promedio de las propiedades que vendés (USD) *">
          <input type="number" inputMode="decimal" className={inputClass} value={precioPromedioVenta} onChange={(e) => setPrecioPromedioVenta(e.target.value)} placeholder="Ej. 150000" />
        </Field>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <Button className="self-end" onClick={guardar} disabled={!valido || guardando}>
          {guardando ? "Guardando…" : "Guardar meta"}
        </Button>
      </div>
    </Modal>
  );
}
