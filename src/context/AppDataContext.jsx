import { createContext, useContext, useState } from "react";
import { newId } from "../lib/ids.js";
import { nuevoChecklist } from "../constants/captacion.js";
import { CONTACTOS_INICIALES, OPORTUNIDADES_INICIALES, ACTIVIDADES_INICIALES, CAPTACIONES_INICIALES } from "../data/seed.js";

const AppDataContext = createContext(null);

// Centraliza los datos de la cartera (contactos, oportunidades, actividades, captaciones) y
// la navegación de la app en un solo lugar. Así cada módulo (Contactos, Agenda, Captación…)
// vive en su propio archivo y solo consume `useAppData()` en vez de recibir una decena de
// props — es lo que permite tocar una pantalla sin arriesgar las demás.
export function AppDataProvider({ children }) {
  const [vista, setVista] = useState("inicio");
  const [contactos, setContactos] = useState(CONTACTOS_INICIALES);
  const [oportunidades, setOportunidades] = useState(OPORTUNIDADES_INICIALES);
  const [actividades, setActividades] = useState(ACTIVIDADES_INICIALES);
  const [captaciones, setCaptaciones] = useState(CAPTACIONES_INICIALES);

  const [crearContactoAbierto, setCrearContactoAbierto] = useState(false);
  const [crearOportunidadAbierto, setCrearOportunidadAbierto] = useState(false);
  const [crearCaptacionAbierto, setCrearCaptacionAbierto] = useState(false);
  const [crearActividadAbierto, setCrearActividadAbierto] = useState(false);
  const [contactarTipo, setContactarTipo] = useState(null); // 'llamar' | 'whatsapp' | 'email'
  const [expedienteId, setExpedienteId] = useState(null); // contacto cuyo expediente está abierto

  const contactoNombre = (id) => contactos.find((c) => c.id === id)?.nombre || "—";
  const abrirExpediente = (id) => setExpedienteId(id);
  const cerrarExpediente = () => setExpedienteId(null);

  function crearActividad(data) {
    setActividades((prev) => [{ id: newId(), estado: "pendiente", ...data }, ...prev]);
  }

  function registrarContacto(contactoId, tipoActividad, titulo) {
    crearActividad({ contactoId, oportunidadId: null, tipo: tipoActividad, titulo, fechaHora: new Date().toISOString(), estado: "completada" });
  }

  function agregarNota(contactoId, texto) {
    if (!texto.trim()) return;
    setContactos((prev) =>
      prev.map((c) =>
        c.id === contactoId
          ? { ...c, ultimoContacto: new Date().toISOString(), notas: [{ id: newId(), fecha: new Date().toISOString(), texto }, ...(c.notas || [])] }
          : c
      )
    );
  }

  function crearContacto(data) {
    setContactos((prev) => [{ id: newId(), ...data }, ...prev]);
  }
  function crearOportunidad(data) {
    setOportunidades((prev) => [{ id: newId(), estado: "activa", etapa: "nueva", ...data }, ...prev]);
  }
  function cerrarOportunidad(id, estado, motivo) {
    setOportunidades((prev) => prev.map((o) => (o.id === id ? { ...o, estado, motivoCierre: motivo } : o)));
  }
  function crearCaptacion(data) {
    setCaptaciones((prev) => [{ id: newId(), estado: "borrador", checklist: nuevoChecklist(), creadoEn: new Date().toISOString(), ...data }, ...prev]);
  }
  function toggleChecklistCaptacion(captacionId, itemId) {
    setCaptaciones((prev) =>
      prev.map((c) => (c.id === captacionId ? { ...c, checklist: c.checklist.map((it) => (it.id === itemId ? { ...it, completado: !it.completado } : it)) } : c))
    );
  }
  function cambiarEstadoCaptacion(captacionId, nuevoEstado) {
    const cap = captaciones.find((c) => c.id === captacionId);
    if (!cap) return { ok: false, error: "Captación no encontrada" };
    if (nuevoEstado === "publicada" && cap.checklist.some((it) => !it.completado)) {
      return { ok: false, error: "No se puede publicar: faltan documentos del checklist." };
    }
    setCaptaciones((prev) => prev.map((c) => (c.id === captacionId ? { ...c, estado: nuevoEstado } : c)));
    return { ok: true };
  }
  function guardarACM(captacionId, datos) {
    setCaptaciones((prev) => prev.map((c) => (c.id === captacionId ? { ...c, acm: datos } : c)));
  }
  function completarActividad(id, resultado, siguiente) {
    let contactoId = null;
    setActividades((prev) => {
      const base = prev.find((a) => a.id === id);
      contactoId = base?.contactoId || null;
      let next = prev.map((a) => (a.id === id ? { ...a, estado: "completada", resultado } : a));
      if (siguiente) {
        next = [{ id: newId(), estado: "pendiente", contactoId: base.contactoId, oportunidadId: base.oportunidadId, tipo: base.tipo, ...siguiente }, ...next];
      }
      return next;
    });
    if (resultado && resultado.trim() && contactoId) agregarNota(contactoId, resultado.trim());
  }
  function reprogramarActividad(id, fechaHora) {
    setActividades((prev) => prev.map((a) => (a.id === id ? { ...a, fechaHora } : a)));
  }
  function cancelarActividad(id) {
    setActividades((prev) => prev.map((a) => (a.id === id ? { ...a, estado: "cancelada" } : a)));
  }

  function manejarAccionRapida(key) {
    if (key === "contactos") setCrearContactoAbierto(true);
    else if (key === "oportunidades") setCrearOportunidadAbierto(true);
    else if (key === "captacion") setCrearCaptacionAbierto(true);
    else if (key === "agenda") setCrearActividadAbierto(true);
    else if (key === "contactos-todos") setVista("contactos");
    else if (key === "llamar" || key === "whatsapp" || key === "email") setContactarTipo(key);
  }

  const value = {
    vista, setVista,
    contactos, oportunidades, actividades, captaciones,
    contactoNombre, registrarContacto, agregarNota,
    crearContacto, crearOportunidad, cerrarOportunidad,
    crearCaptacion, toggleChecklistCaptacion, cambiarEstadoCaptacion, guardarACM,
    crearActividad, completarActividad, reprogramarActividad, cancelarActividad,
    crearContactoAbierto, setCrearContactoAbierto,
    crearOportunidadAbierto, setCrearOportunidadAbierto,
    crearCaptacionAbierto, setCrearCaptacionAbierto,
    crearActividadAbierto, setCrearActividadAbierto,
    contactarTipo, setContactarTipo,
    expedienteId, abrirExpediente, cerrarExpediente,
    manejarAccionRapida,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData debe usarse dentro de <AppDataProvider>");
  return ctx;
}
