import { useState } from "react";
import { Modal, Field, Button, inputClass } from "../ui/index.js";
import { ContactoQuickButtons } from "./ContactoQuickButtons.jsx";
import { toLocalInput } from "../../lib/dates.js";

// Modal para completar o reprogramar una actividad — usado desde Inicio y Agenda.
export function AccionModal({ actividad, accion, contacto, registrarContacto, onAbrirContacto, onClose, onCompletar, onReprogramar, onCancelar }) {
  const [resultado, setResultado] = useState("");
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [crearSiguiente, setCrearSiguiente] = useState(false);
  const [tituloSig, setTituloSig] = useState("");
  const [fechaSig, setFechaSig] = useState("");

  if (!actividad || !accion) return null;

  return (
    <Modal open onClose={onClose} title={accion === "completar" ? "Completar actividad" : "Reprogramar actividad"}>
      <p className="mb-4 text-sm text-black/60">{actividad.titulo}</p>
      {accion === "completar" ? (
        <div className="flex flex-col gap-4">
          {contacto && (
            <div className="rounded-xl border border-black/10 p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-xs font-medium text-black/45">Contactar a {contacto.nombre}</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAbrirContacto(contacto.id);
                  }}
                  className="shrink-0 text-xs font-medium text-brand-700"
                >
                  Ver expediente →
                </button>
              </div>
              <ContactoQuickButtons contacto={contacto} registrar={registrarContacto} />
              {contacto.notas?.[0] && (
                <p className="mt-2.5 rounded-lg bg-gray-50 px-2.5 py-2 text-xs italic text-gray-500">💬 “{contacto.notas[0].texto}”</p>
              )}
            </div>
          )}
          <Field label="Resultado (opcional)">
            <textarea className={inputClass} rows={2} value={resultado} onChange={(e) => setResultado(e.target.value)} />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-900">
            <input type="checkbox" checked={crearSiguiente} onChange={(e) => setCrearSiguiente(e.target.checked)} /> Crear próxima acción
          </label>
          {crearSiguiente && (
            <div className="flex flex-col gap-3 rounded-xl bg-gray-100 p-3">
              <Field label="Título">
                <input className={inputClass} value={tituloSig} onChange={(e) => setTituloSig(e.target.value)} />
              </Field>
              <Field label="Fecha y hora">
                <input type="datetime-local" className={inputClass} value={fechaSig} onChange={(e) => setFechaSig(e.target.value)} />
              </Field>
            </div>
          )}
          <div className="flex justify-between gap-2 pt-2">
            <Button variant="ghost" onClick={onCancelar}>
              Cancelar actividad
            </Button>
            <Button
              onClick={() =>
                onCompletar(resultado, crearSiguiente && tituloSig && fechaSig ? { titulo: tituloSig, fechaHora: new Date(fechaSig).toISOString() } : null)
              }
            >
              Marcar completada
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Nueva fecha y hora">
            <input
              type="datetime-local"
              className={inputClass}
              defaultValue={toLocalInput(new Date(Date.now() + 86400000).toISOString())}
              onChange={(e) => setNuevaFecha(e.target.value)}
            />
          </Field>
          <Button className="self-end" onClick={() => onReprogramar(new Date(nuevaFecha || Date.now() + 86400000).toISOString())}>
            Guardar nueva fecha
          </Button>
        </div>
      )}
    </Modal>
  );
}
