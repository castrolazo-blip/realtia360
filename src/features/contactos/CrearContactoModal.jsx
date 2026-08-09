import { useState } from "react";
import { Modal, Field, Button, inputClass } from "../../components/ui/index.js";
import { CLASIFICACIONES, CLASIFICACION_LABEL, CIRCULOS, CIRCULO_LABEL, CIRCULO_EMOJI, CERCANIA_OPCIONES, POTENCIAL_OPCIONES } from "../../constants/contactos.js";
import { guardarEnContactosDelCelular } from "../../lib/contacts.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";

export function CrearContactoModal({ open, onClose, onCrear }) {
  const { agency } = useAppData();
  const [nombre, setNombre] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [clasificacion, setClasificacion] = useState("contacto_relacion");
  const [mostrarCirculo, setMostrarCirculo] = useState(false);
  const [circulo, setCirculo] = useState("");
  const [cercania, setCercania] = useState("Media");
  const [profesion, setProfesion] = useState("");
  const [cumpleanos, setCumpleanos] = useState("");
  const [potencialReferidos, setPotencialReferidos] = useState("Medio");
  const [valorEstrategico, setValorEstrategico] = useState("estandar");
  const [guardarEnCelular, setGuardarEnCelular] = useState(true);

  function guardar() {
    if (!nombre) return;
    const contacto = {
      nombre, empresa: empresa || null, ciudad: ciudad || null, telefono, correo, clasificacion,
      circulo: circulo || null, cercania, profesion: profesion || null,
      cumpleanos: cumpleanos ? cumpleanos.slice(5) : "", ultimoContacto: new Date().toISOString(),
      potencialReferidos, valorEstrategico, intereses: "",
    };
    onCrear(contacto);
    if (guardarEnCelular) guardarEnContactosDelCelular(contacto, agency);
    setNombre(""); setEmpresa(""); setCiudad(""); setTelefono(""); setCorreo(""); setClasificacion("contacto_relacion");
    setCirculo(""); setCercania("Media"); setProfesion(""); setCumpleanos(""); setPotencialReferidos("Medio"); setValorEstrategico("estandar");
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo contacto">
      <div className="flex flex-col gap-4">
        <Field label="Nombre completo *"><input className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Ana Beatriz Rivas" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Empresa"><input className={inputClass} value={empresa} onChange={(e) => setEmpresa(e.target.value)} /></Field>
          <Field label="Ciudad"><input className={inputClass} value={ciudad} onChange={(e) => setCiudad(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono"><input className={inputClass} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+503 7000-0000" /></Field>
          <Field label="Correo"><input className={inputClass} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" /></Field>
        </div>
        <Field label="Clasificación">
          <select className={inputClass} value={clasificacion} onChange={(e) => setClasificacion(e.target.value)}>
            {CLASIFICACIONES.map((c) => <option key={c} value={c}>{CLASIFICACION_LABEL[c]}</option>)}
          </select>
        </Field>

        <button type="button" onClick={() => setMostrarCirculo((v) => !v)} className="flex items-center justify-between rounded-xl bg-indigo-50 px-3.5 py-2.5 text-left text-sm font-medium text-indigo-700">
          🎯 Círculo de Influencia (opcional)
          <Icon.ChevronDown className={`h-4 w-4 transition ${mostrarCirculo ? "rotate-180" : ""}`} />
        </button>

        {mostrarCirculo && (
          <div className="flex flex-col gap-3 rounded-xl bg-gray-100 p-3">
            <Field label="Categoría">
              <select className={inputClass} value={circulo} onChange={(e) => setCirculo(e.target.value)}>
                <option value="">Sin categoría</option>
                {CIRCULOS.map((c) => <option key={c} value={c}>{CIRCULO_EMOJI[c]} {CIRCULO_LABEL[c]}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Cercanía">
                <select className={inputClass} value={cercania} onChange={(e) => setCercania(e.target.value)}>
                  {CERCANIA_OPCIONES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Profesión"><input className={inputClass} value={profesion} onChange={(e) => setProfesion(e.target.value)} /></Field>
            </div>
            <Field label="Cumpleaños"><input type="date" className={inputClass} value={cumpleanos} onChange={(e) => setCumpleanos(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Potencial de referidos">
                <select className={inputClass} value={potencialReferidos} onChange={(e) => setPotencialReferidos(e.target.value)}>
                  {POTENCIAL_OPCIONES.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Valor estratégico">
                <select className={inputClass} value={valorEstrategico} onChange={(e) => setValorEstrategico(e.target.value)}>
                  <option value="estandar">Estándar</option>
                  <option value="vip">VIP</option>
                </select>
              </Field>
            </div>
          </div>
        )}

        <label className="flex items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-3 text-sm text-gray-700">
          <input type="checkbox" checked={guardarEnCelular} onChange={(e) => setGuardarEnCelular(e.target.checked)} />
          📇 Guardar también en los contactos de mi celular
        </label>

        <Button className="self-end" onClick={guardar} disabled={!nombre}>Guardar contacto</Button>
      </div>
    </Modal>
  );
}
