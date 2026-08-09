import { useState } from "react";
import { Modal, Field, Button, inputClass } from "../ui/index.js";
import { useAppData } from "../../context/AppDataContext.jsx";

// Editar el perfil del agente (nombre, teléfono, oficina, ubicación) y cerrar sesión.
// Se abre desde el sidebar de escritorio y desde el avatar en móvil.
export function PerfilModal({ open, onClose }) {
  const { agency, actualizarPerfil, signOut } = useAppData();
  const [nombreAgente, setNombreAgente] = useState(agency.nombreAgente);
  const [telefono, setTelefono] = useState(agency.telefono);
  const [nombreOficina, setNombreOficina] = useState(agency.nombreOficina);
  const [ubicacion, setUbicacion] = useState(agency.ubicacion);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function guardar() {
    setGuardando(true);
    setError("");
    setGuardado(false);
    const res = await actualizarPerfil({ nombreAgente, telefono, nombreOficina, ubicacion });
    setGuardando(false);
    if (res.ok) {
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } else {
      setError(res.error || "No se pudo guardar el perfil.");
    }
  }

  return (
    <Modal open onClose={onClose} title="Tu perfil">
      <div className="flex flex-col gap-4">
        <Field label="Tu nombre"><input className={inputClass} value={nombreAgente} onChange={(e) => setNombreAgente(e.target.value)} /></Field>
        <Field label="Teléfono">
          <input type="tel" inputMode="tel" className={inputClass} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+503 7000-0000" />
        </Field>
        <p className="-mt-2 text-xs text-black/40">Aparece en tus fichas de propiedad y en las descripciones que genera la IA.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Oficina / equipo"><input className={inputClass} value={nombreOficina} onChange={(e) => setNombreOficina(e.target.value)} /></Field>
          <Field label="Ubicación"><input className={inputClass} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} /></Field>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="flex items-center justify-between gap-2 pt-2">
          <button onClick={signOut} className="text-sm font-medium text-rose-600 hover:text-rose-700">
            Cerrar sesión
          </button>
          <Button onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando…" : guardado ? "¡Guardado!" : "Guardar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
