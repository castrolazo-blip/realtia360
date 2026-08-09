import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { useAuth } from "./AuthContext.jsx";
import { nuevoChecklist } from "../constants/captacion.js";
import { agency as agencyPorDefecto } from "../config/agency.js";
import {
  contactoFromRow, contactoToRow,
  oportunidadFromRow, oportunidadToRow,
  actividadFromRow, actividadToRow,
  captacionFromRow, captacionToRow,
  perfilFromRow,
} from "../lib/db/mappers.js";
import { CONTACTOS_INICIALES, OPORTUNIDADES_INICIALES, ACTIVIDADES_INICIALES, CAPTACIONES_INICIALES } from "../data/seed.js";

const AppDataContext = createContext(null);

// Centraliza la cartera (contactos, oportunidades, actividades, captaciones), el perfil
// del agente y la navegación de la app. Todo vive en Supabase — este contexto es la
// única pieza que sabe hablar con la base de datos; los módulos de features/ solo
// consumen useAppData() con los mismos nombres de siempre.
export function AppDataProvider({ children }) {
  const { usuario, signOut } = useAuth();
  const agenteId = usuario?.id;

  const [vista, setVista] = useState("inicio");
  const [contactos, setContactos] = useState([]);
  const [oportunidades, setOportunidades] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [captaciones, setCaptaciones] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  const [crearContactoAbierto, setCrearContactoAbierto] = useState(false);
  const [crearOportunidadAbierto, setCrearOportunidadAbierto] = useState(false);
  const [crearCaptacionAbierto, setCrearCaptacionAbierto] = useState(false);
  const [crearActividadAbierto, setCrearActividadAbierto] = useState(false);
  const [contactarTipo, setContactarTipo] = useState(null); // 'llamar' | 'whatsapp' | 'email'
  const [expedienteId, setExpedienteId] = useState(null); // contacto cuyo expediente está abierto

  const recargarTodo = useCallback(async () => {
    if (!agenteId) return;
    setCargando(true);
    setErrorCarga("");
    try {
      let [perfilRes, contactosRes, oportunidadesRes, actividadesRes, captacionesRes] = await Promise.all([
        supabase.from("realtia_perfiles").select("*").eq("id", agenteId).maybeSingle(),
        supabase.from("realtia_contactos").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }),
        supabase.from("realtia_oportunidades").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }),
        supabase.from("realtia_actividades").select("*").eq("agente_id", agenteId).order("fecha_hora", { ascending: false }),
        supabase.from("realtia_captaciones").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }),
      ]);
      // Red de seguridad: si por alguna razón el trigger de la base de datos no creó el
      // perfil al registrarse, lo creamos aquí mismo con lo que haya en los metadatos de auth.
      if (!perfilRes.data) {
        const meta = usuario?.user_metadata || {};
        const { data: nuevoPerfil } = await supabase
          .from("realtia_perfiles")
          .insert({
            id: agenteId,
            nombre_agente: meta.nombre_agente || usuario?.email?.split("@")[0] || "Agente",
            nombre_oficina: meta.nombre_oficina || "Mi oficina",
            ubicacion: meta.ubicacion || "",
          })
          .select().single();
        if (nuevoPerfil) perfilRes = { data: nuevoPerfil };
      }
      setPerfil(perfilRes.data ? perfilFromRow(perfilRes.data) : null);
      setContactos((contactosRes.data || []).map(contactoFromRow));
      setOportunidades((oportunidadesRes.data || []).map(oportunidadFromRow));
      setActividades((actividadesRes.data || []).map(actividadFromRow));
      setCaptaciones((captacionesRes.data || []).map(captacionFromRow));
    } catch (err) {
      console.error("recargarTodo", err);
      setErrorCarga("No se pudo cargar tu cartera. Revisa tu conexión e intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  }, [agenteId]);

  useEffect(() => {
    recargarTodo();
  }, [recargarTodo]);

  const contactoNombre = (id) => contactos.find((c) => c.id === id)?.nombre || "—";
  const abrirExpediente = (id) => setExpedienteId(id);
  const cerrarExpediente = () => setExpedienteId(null);

  async function crearActividad(data) {
    const { data: row, error } = await supabase.from("realtia_actividades").insert({ agente_id: agenteId, ...actividadToRow(data) }).select().single();
    if (error) { console.error("crearActividad", error); return; }
    setActividades((prev) => [actividadFromRow(row), ...prev]);
  }

  function registrarContacto(contactoId, tipoActividad, titulo) {
    crearActividad({ contactoId, oportunidadId: null, tipo: tipoActividad, titulo, fechaHora: new Date().toISOString(), estado: "completada" });
  }

  async function agregarNota(contactoId, texto) {
    if (!texto.trim()) return;
    const contacto = contactos.find((c) => c.id === contactoId);
    if (!contacto) return;
    const ultimoContacto = new Date().toISOString();
    const notas = [{ id: crypto.randomUUID(), fecha: ultimoContacto, texto }, ...(contacto.notas || [])];
    const { error } = await supabase.from("realtia_contactos").update({ notas, ultimo_contacto: ultimoContacto }).eq("id", contactoId);
    if (error) { console.error("agregarNota", error); return; }
    setContactos((prev) => prev.map((c) => (c.id === contactoId ? { ...c, ultimoContacto, notas } : c)));
  }

  async function crearContacto(data) {
    const { data: row, error } = await supabase.from("realtia_contactos").insert({ agente_id: agenteId, ...contactoToRow(data) }).select().single();
    if (error) { console.error("crearContacto", error); return; }
    setContactos((prev) => [contactoFromRow(row), ...prev]);
  }

  async function crearOportunidad(data) {
    const { data: row, error } = await supabase
      .from("realtia_oportunidades")
      .insert({ agente_id: agenteId, ...oportunidadToRow({ estado: "activa", etapa: "nueva", ...data }) })
      .select().single();
    if (error) { console.error("crearOportunidad", error); return; }
    setOportunidades((prev) => [oportunidadFromRow(row), ...prev]);
  }

  async function cerrarOportunidad(id, estado, motivo) {
    const { error } = await supabase.from("realtia_oportunidades").update({ estado, motivo_cierre: motivo }).eq("id", id);
    if (error) { console.error("cerrarOportunidad", error); return; }
    setOportunidades((prev) => prev.map((o) => (o.id === id ? { ...o, estado, motivoCierre: motivo } : o)));
  }

  async function crearCaptacion(data) {
    const { data: row, error } = await supabase
      .from("realtia_captaciones")
      .insert({ agente_id: agenteId, ...captacionToRow({ estado: "borrador", checklist: nuevoChecklist(), ...data }) })
      .select().single();
    if (error) { console.error("crearCaptacion", error); return; }
    setCaptaciones((prev) => [captacionFromRow(row), ...prev]);
  }

  async function toggleChecklistCaptacion(captacionId, itemId) {
    const cap = captaciones.find((c) => c.id === captacionId);
    if (!cap) return;
    const checklist = cap.checklist.map((it) => (it.id === itemId ? { ...it, completado: !it.completado } : it));
    const { error } = await supabase.from("realtia_captaciones").update({ checklist }).eq("id", captacionId);
    if (error) { console.error("toggleChecklistCaptacion", error); return; }
    setCaptaciones((prev) => prev.map((c) => (c.id === captacionId ? { ...c, checklist } : c)));
  }

  async function cambiarEstadoCaptacion(captacionId, nuevoEstado) {
    const cap = captaciones.find((c) => c.id === captacionId);
    if (!cap) return { ok: false, error: "Captación no encontrada" };
    if (nuevoEstado === "publicada" && cap.checklist.some((it) => !it.completado)) {
      return { ok: false, error: "No se puede publicar: faltan documentos del checklist." };
    }
    const { error } = await supabase.from("realtia_captaciones").update({ estado: nuevoEstado }).eq("id", captacionId);
    if (error) return { ok: false, error: error.message };
    setCaptaciones((prev) => prev.map((c) => (c.id === captacionId ? { ...c, estado: nuevoEstado } : c)));
    return { ok: true };
  }

  async function guardarACM(captacionId, datos) {
    const { error } = await supabase.from("realtia_captaciones").update({ acm: datos }).eq("id", captacionId);
    if (error) { console.error("guardarACM", error); return; }
    setCaptaciones((prev) => prev.map((c) => (c.id === captacionId ? { ...c, acm: datos } : c)));
  }

  async function guardarDescripcionIA(captacionId, texto) {
    const { error } = await supabase.from("realtia_captaciones").update({ descripcion_ia: texto }).eq("id", captacionId);
    if (error) { console.error("guardarDescripcionIA", error); return; }
    setCaptaciones((prev) => prev.map((c) => (c.id === captacionId ? { ...c, descripcionIA: texto } : c)));
  }

  async function completarActividad(id, resultado, siguiente) {
    const base = actividades.find((a) => a.id === id);
    if (!base) return;
    const { error } = await supabase.from("realtia_actividades").update({ estado: "completada", resultado }).eq("id", id);
    if (error) { console.error("completarActividad", error); return; }
    setActividades((prev) => prev.map((a) => (a.id === id ? { ...a, estado: "completada", resultado } : a)));
    if (siguiente) {
      await crearActividad({ contactoId: base.contactoId, oportunidadId: base.oportunidadId, tipo: base.tipo, estado: "pendiente", ...siguiente });
    }
    if (resultado && resultado.trim() && base.contactoId) await agregarNota(base.contactoId, resultado.trim());
  }

  async function reprogramarActividad(id, fechaHora) {
    const { error } = await supabase.from("realtia_actividades").update({ fecha_hora: fechaHora }).eq("id", id);
    if (error) { console.error("reprogramarActividad", error); return; }
    setActividades((prev) => prev.map((a) => (a.id === id ? { ...a, fechaHora } : a)));
  }

  async function cancelarActividad(id) {
    const { error } = await supabase.from("realtia_actividades").update({ estado: "cancelada" }).eq("id", id);
    if (error) { console.error("cancelarActividad", error); return; }
    setActividades((prev) => prev.map((a) => (a.id === id ? { ...a, estado: "cancelada" } : a)));
  }

  // Para cuentas nuevas y vacías: precarga la misma cartera de ejemplo de la Fase 1,
  // ya guardada de verdad en la base de datos del agente autenticado.
  async function cargarDatosDemo() {
    if (!agenteId) return;
    const mapaContactos = {};
    for (const c of CONTACTOS_INICIALES) {
      const { data: row, error } = await supabase.from("realtia_contactos").insert({ agente_id: agenteId, ...contactoToRow(c) }).select().single();
      if (error) { console.error("cargarDatosDemo/contacto", error); continue; }
      mapaContactos[c.id] = row.id;
    }
    await Promise.all([
      ...OPORTUNIDADES_INICIALES.map((o) =>
        supabase.from("realtia_oportunidades").insert({ agente_id: agenteId, ...oportunidadToRow({ ...o, contactoId: mapaContactos[o.contactoId] }) })
      ),
      ...ACTIVIDADES_INICIALES.map((a) =>
        supabase.from("realtia_actividades").insert({ agente_id: agenteId, ...actividadToRow({ ...a, contactoId: mapaContactos[a.contactoId], oportunidadId: null }) })
      ),
      ...CAPTACIONES_INICIALES.map((c) =>
        supabase.from("realtia_captaciones").insert({ agente_id: agenteId, ...captacionToRow({ ...c, contactoId: mapaContactos[c.contactoId] }) })
      ),
    ]);
    await recargarTodo();
  }

  function manejarAccionRapida(key) {
    if (key === "contactos") setCrearContactoAbierto(true);
    else if (key === "oportunidades") setCrearOportunidadAbierto(true);
    else if (key === "captacion") setCrearCaptacionAbierto(true);
    else if (key === "agenda") setCrearActividadAbierto(true);
    else if (key === "contactos-todos") setVista("contactos");
    else if (key === "llamar" || key === "whatsapp" || key === "email") setContactarTipo(key);
  }

  const agency = {
    producto: agencyPorDefecto.producto,
    nombreOficina: perfil?.nombreOficina || agencyPorDefecto.nombreOficina,
    nombreAgente: perfil?.nombreAgente || agencyPorDefecto.nombreAgente,
    inicialAgente: (perfil?.nombreAgente || agencyPorDefecto.nombreAgente).charAt(0).toUpperCase(),
    ubicacion: perfil?.ubicacion || agencyPorDefecto.ubicacion,
    plan: perfil?.plan || "basic",
  };

  const value = {
    vista, setVista,
    cargando, errorCarga, recargarTodo, agency, signOut,
    contactos, oportunidades, actividades, captaciones,
    contactoNombre, registrarContacto, agregarNota,
    crearContacto, crearOportunidad, cerrarOportunidad,
    crearCaptacion, toggleChecklistCaptacion, cambiarEstadoCaptacion, guardarACM, guardarDescripcionIA,
    crearActividad, completarActividad, reprogramarActividad, cancelarActividad,
    cargarDatosDemo,
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
