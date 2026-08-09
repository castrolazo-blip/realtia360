import { useState } from "react";
import { Modal, Field, Button, inputClass, OpcionesBotones } from "../../components/ui/index.js";
import { CLASIFICACIONES, CLASIFICACION_LABEL, CIRCULOS, CIRCULO_LABEL, CIRCULO_EMOJI, CERCANIA_OPCIONES, POTENCIAL_OPCIONES } from "../../constants/contactos.js";
import { guardarEnContactosDelCelular } from "../../lib/contacts.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";

const OPCIONES_CLASIFICACION = CLASIFICACIONES.map((c) => ({ value: c, label: CLASIFICACION_LABEL[c] }));
const OPCIONES_CIRCULO = [{ value: "", label: "Sin categoría" }, ...CIRCULOS.map((c) => ({ value: c, label: CIRCULO_LABEL[c], emoji: CIRCULO_EMOJI[c] }))];
const OPCIONES_CERCANIA = CERCANIA_OPCIONES.map((o) => ({ value: o, label: o }));
const OPCIONES_POTENCIAL = POTENCIAL_OPCIONES.map((o) => ({ value: o, label: o }));
const OPCIONES_VALOR = [{ value: "estandar", label: "Estándar" }, { value: "vip", label: "⭐ VIP" }];

export function CrearContactoModal({ open, onClose, onCrear }) {
  const { agency } = useAppData();
  const [nombre, setNombre] = useState("");
  const [notaEspecial, setNotaEspecial] = useState("");
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
    const textoNota = notaEspecial.trim();
    const contacto = {
      nombre, empresa: empresa || null, ciudad: ciudad || null, telefono, correo, clasificacion,
      circulo: circulo || null, cercania, profesion: profesion || null,
      cumpleanos: cumpleanos ? cumpleanos.slice(5) : "", ultimoContacto: new Date().toISOString(),
      potencialReferidos, valorEstrategico, intereses: "",
      notas: textoNota ? [{ id: crypto.randomUUID(), fecha: new Date().toISOString(), texto: textoNota }] : [],
    };
    onCrear(contacto);
    if (guardarEnCelular) guardarEnContactosDelCelular(contacto, agency);
    setNombre(""); setNotaEspecial(""); setEmpresa(""); setCiudad(""); setTelefono(""); setCorreo(""); setClasificacion("contacto_relacion");
    setCirculo(""); setCercania("Media"); setProfesion(""); setCumpleanos(""); setPotencialReferidos("Medio"); setValorEstrategico("estandar");
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo contacto">
      <div className="flex flex-col gap-4">
        <Field label="Nombre completo *"><input className={inputClass} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Ana Beatriz Rivas" /></Field>

        <div>
          <Field label="💬 Nota especial (opcional)">
            <textarea
              className={inputClass}
              rows={2}
              value={notaEspecial}
              onChange={(e) => setNotaEspecial(e.target.value)}
              placeholder="Ej. Nos conocimos en la boda de Ana, quiere comprar casa el próximo año…"
            />
          </Field>
          <p className="mt-1 text-xs text-black/40">Algo que te ayude a recordar por qué guardaste este contacto. Queda en su historial de comentarios.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Empresa"><input className={inputClass} value={empresa} onChange={(e) => setEmpresa(e.target.value)} /></Field>
          <Field label="Ciudad"><input className={inputClass} value={ciudad} onChange={(e) => setCiudad(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teléfono"><input type="tel" inputMode="tel" className={inputClass} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+503 7000-0000" /></Field>
          <Field label="Correo"><input type="email" inputMode="email" className={inputClass} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" /></Field>
        </div>
        <Field label="Clasificación">
          <OpcionesBotones columnas={2} opciones={OPCIONES_CLASIFICACION} valor={clasificacion} onChange={setClasificacion} />
        </Field>

        <button type="button" onClick={() => setMostrarCirculo((v) => !v)} className="flex items-center justify-between rounded-xl bg-indigo-50 px-3.5 py-2.5 text-left text-sm font-medium text-indigo-700">
          🎯 Círculo de Influencia (opcional)
          <Icon.ChevronDown className={`h-4 w-4 transition ${mostrarCirculo ? "rotate-180" : ""}`} />
        </button>

        {mostrarCirculo && (
          <div className="flex flex-col gap-4 rounded-xl bg-gray-100 p-3">
            <Field label="Categoría">
              <OpcionesBotones columnas={2} opciones={OPCIONES_CIRCULO} valor={circulo} onChange={setCirculo} />
            </Field>
            <Field label="Cercanía">
              <OpcionesBotones columnas={3} opciones={OPCIONES_CERCANIA} valor={cercania} onChange={setCercania} />
            </Field>
            <Field label="Profesión"><input className={inputClass} value={profesion} onChange={(e) => setProfesion(e.target.value)} /></Field>
            <Field label="Cumpleaños"><input type="date" className={inputClass} value={cumpleanos} onChange={(e) => setCumpleanos(e.target.value)} /></Field>
            <Field label="Potencial de referidos">
              <OpcionesBotones columnas={3} opciones={OPCIONES_POTENCIAL} valor={potencialReferidos} onChange={setPotencialReferidos} />
            </Field>
            <Field label="Valor estratégico">
              <OpcionesBotones columnas={2} opciones={OPCIONES_VALOR} valor={valorEstrategico} onChange={setValorEstrategico} />
            </Field>
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
