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
  requerimientoFromRow, requerimientoToRow,
  kycFromRow, kycToRow,
  interaccionFromRow,
  planFromRow, planToRow,
  perfilFromRow,
} from "../lib/db/mappers.js";
import { calcularRiesgo } from "../features/kyc/riesgo.js";
import { RESULTADOS, HORA_LLAMADA_DEFECTO } from "../constants/gestion.js";
import { subirFoto, borrarFoto } from "../lib/fotos.js";
import { anioDelPlan } from "../constants/plan.js";
import { CONTACTOS_INICIALES, OPORTUNIDADES_INICIALES, ACTIVIDADES_INICIALES, CAPTACIONES_INICIALES } from "../data/seed.js";

const AppDataContext = createContext(null);

const METRICAS_VACIAS = { contactos: [], oportunidades: [], captaciones: [], actividades: [], kyc: [], interacciones: [], planes: [] };

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
  const [requerimientos, setRequerimientos] = useState([]);
  const [kyc, setKyc] = useState([]);
  const [interacciones, setInteracciones] = useState([]);
  // Plan de negocio del año del plan (obligatorio para el asesor: es la puerta de entrada).
  const [plan, setPlan] = useState(null);
  // Contacto que se quiere llamar directamente desde su ficha (fuera del orden de la cola).
  const [llamarA, setLlamarA] = useState(null);
  // Filtro con el que se abre Contactos cuando se llega desde el círculo virtuoso.
  const [filtroContactos, setFiltroContactos] = useState("");
  const [perfil, setPerfil] = useState(null);

  // Directorio (id + nombre + rol de los compañeros de oficina) y propiedades publicadas
  // de toda la oficina: se cargan para cualquier agente con oficina, no solo el broker —
  // es el inventario compartido, no la cartera privada de cada quien.
  const [directorioOficina, setDirectorioOficina] = useState([]);
  const [propiedadesOficina, setPropiedadesOficina] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState("");

  // Solo se llenan para un Broker: su equipo (perfiles de la misma oficina) y las MÉTRICAS
  // de toda la oficina — solo números y estados, nunca nombres, teléfonos ni notas de los
  // clientes de cada asesor (lo garantiza la función realtia_metricas_oficina en la base).
  const [equipo, setEquipo] = useState([]);
  const [oficinaCartera, setOficinaCartera] = useState(METRICAS_VACIAS);

  const [crearContactoAbierto, setCrearContactoAbierto] = useState(false);
  const [crearOportunidadAbierto, setCrearOportunidadAbierto] = useState(false);
  const [crearCaptacionAbierto, setCrearCaptacionAbierto] = useState(false);
  const [crearActividadAbierto, setCrearActividadAbierto] = useState(false);
  const [crearRequerimientoAbierto, setCrearRequerimientoAbierto] = useState(false);
  const [crearKycAbierto, setCrearKycAbierto] = useState(false);
  const [importarAbierto, setImportarAbierto] = useState(false);
  const [contactarTipo, setContactarTipo] = useState(null); // 'llamar' | 'whatsapp' | 'email'
  const [expedienteId, setExpedienteId] = useState(null); // contacto cuyo expediente está abierto

  const recargarTodo = useCallback(async () => {
    if (!agenteId) return;
    setCargando(true);
    setErrorCarga("");
    try {
      let [perfilRes, contactosRes, oportunidadesRes, actividadesRes, captacionesRes, requerimientosRes, kycRes, interaccionesRes, planRes] = await Promise.all([
        supabase.from("realtia_perfiles").select("*").eq("id", agenteId).maybeSingle(),
        supabase.from("realtia_contactos").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }),
        supabase.from("realtia_oportunidades").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }),
        supabase.from("realtia_actividades").select("*").eq("agente_id", agenteId).order("fecha_hora", { ascending: false }),
        supabase.from("realtia_captaciones").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }),
        supabase.from("realtia_requerimientos").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }),
        supabase.from("realtia_kyc").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }),
        supabase.from("realtia_interacciones").select("*").eq("agente_id", agenteId).order("created_at", { ascending: false }).limit(3000),
        supabase.from("realtia_planes").select("*").eq("agente_id", agenteId).eq("anio", anioDelPlan()).maybeSingle(),
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
      const perfilMapeado = perfilRes.data ? perfilFromRow(perfilRes.data) : null;
      setPerfil(perfilMapeado);
      setContactos((contactosRes.data || []).map(contactoFromRow));
      setOportunidades((oportunidadesRes.data || []).map(oportunidadFromRow));
      setActividades((actividadesRes.data || []).map(actividadFromRow));
      setCaptaciones((captacionesRes.data || []).map(captacionFromRow));
      setRequerimientos((requerimientosRes.data || []).map(requerimientoFromRow));
      setKyc((kycRes.data || []).map(kycFromRow));
      setInteracciones((interaccionesRes.data || []).map(interaccionFromRow));
      setPlan(planRes.data ? planFromRow(planRes.data) : null);

      // Propiedades: inventario publicado de toda la oficina, y el directorio (id/nombre)
      // de los compañeros para poder mostrar quién es el asesor responsable. Esto es para
      // cualquier agente con oficina, no solo el broker.
      if (perfilMapeado?.oficinaId) {
        const [directorioRes, propiedadesOfRes] = await Promise.all([
          supabase.rpc("realtia_directorio_oficina"),
          supabase.from("realtia_captaciones").select("*").eq("estado", "publicada").order("created_at", { ascending: false }),
        ]);
        setDirectorioOficina(directorioRes.data || []);
        setPropiedadesOficina((propiedadesOfRes.data || []).map(captacionFromRow));
      } else {
        setDirectorioOficina([]);
        setPropiedadesOficina([]);
      }

      // Office Pulse: si el perfil es de un Broker, trae además el equipo y las métricas de
      // la oficina. Solo números: la función de la base no devuelve ningún dato del cliente.
      if (perfilMapeado?.rol === "broker" && perfilMapeado.oficinaId) {
        const [equipoRes, metricasRes] = await Promise.all([
          supabase.from("realtia_perfiles").select("id, nombre_agente, rol"),
          supabase.rpc("realtia_metricas_oficina"),
        ]);
        setEquipo(equipoRes.data || []);
        setOficinaCartera({ ...METRICAS_VACIAS, ...(metricasRes.data || {}) });
      } else {
        setEquipo([]);
        setOficinaCartera(METRICAS_VACIAS);
      }
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
  const telefonoAgente = (id) => (id === agenteId ? agency.telefono : directorioOficina.find((p) => p.id === id)?.telefono) || "";
  const nombreAgente = (id) => (id === agenteId ? agency.nombreAgente : directorioOficina.find((p) => p.id === id)?.nombre_agente) || "—";
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
    if (error) { console.error("crearContacto", error); return null; }
    const nuevo = contactoFromRow(row);
    setContactos((prev) => [nuevo, ...prev]);
    return nuevo;
  }

  async function actualizarContacto(id, datos) {
    const contacto = contactos.find((c) => c.id === id);
    if (!contacto) return { ok: false, error: "Contacto no encontrado" };
    const actualizado = { ...contacto, ...datos };
    const { error } = await supabase.from("realtia_contactos").update(contactoToRow(actualizado)).eq("id", id);
    if (error) { console.error("actualizarContacto", error); return { ok: false, error: error.message }; }
    setContactos((prev) => prev.map((c) => (c.id === id ? actualizado : c)));
    return { ok: true };
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
    const cerradaEn = new Date().toISOString();
    const { error } = await supabase.from("realtia_oportunidades").update({ estado, motivo_cierre: motivo, cerrada_en: cerradaEn }).eq("id", id);
    if (error) { console.error("cerrarOportunidad", error); return; }
    setOportunidades((prev) => prev.map((o) => (o.id === id ? { ...o, estado, motivoCierre: motivo, cerradaEn } : o)));
  }

  async function actualizarOportunidad(id, datos) {
    const op = oportunidades.find((o) => o.id === id);
    if (!op) return { ok: false, error: "Oportunidad no encontrada" };
    const actualizada = { ...op, ...datos };
    const { error } = await supabase.from("realtia_oportunidades").update(oportunidadToRow(actualizada)).eq("id", id);
    if (error) { console.error("actualizarOportunidad", error); return { ok: false, error: error.message }; }
    setOportunidades((prev) => prev.map((o) => (o.id === id ? actualizada : o)));
    return { ok: true };
  }

  // Agenda de verdad la próxima acción de una oportunidad: crea una actividad real (que
  // aparece en la Agenda) en vez de dejar la fecha como un simple texto suelto en la tarjeta.
  async function agendarSeguimientoOportunidad(oportunidadId, contactoId, titulo, fechaHoraISO) {
    await crearActividad({ contactoId, oportunidadId, tipo: "seguimiento", titulo, fechaHora: fechaHoraISO, estado: "pendiente" });
    return actualizarOportunidad(oportunidadId, { proximaAccion: titulo, proximaFecha: fechaHoraISO });
  }

  async function crearCaptacion(data) {
    const { data: row, error } = await supabase
      .from("realtia_captaciones")
      .insert({ agente_id: agenteId, ...captacionToRow({ estado: "borrador", checklist: nuevoChecklist(), ...data }) })
      .select().single();
    if (error) { console.error("crearCaptacion", error); return; }
    setCaptaciones((prev) => [captacionFromRow(row), ...prev]);
  }

  async function actualizarCaptacion(id, datos) {
    const cap = captaciones.find((c) => c.id === id);
    if (!cap) return { ok: false, error: "Captación no encontrada" };
    const actualizada = { ...cap, ...datos };
    const { error } = await supabase.from("realtia_captaciones").update(captacionToRow(actualizada)).eq("id", id);
    if (error) { console.error("actualizarCaptacion", error); return { ok: false, error: error.message }; }
    setCaptaciones((prev) => prev.map((c) => (c.id === id ? actualizada : c)));
    return { ok: true };
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

  async function cambiarDisponibilidad(captacionId, disponibilidad) {
    const { error } = await supabase.from("realtia_captaciones").update({ disponibilidad }).eq("id", captacionId);
    if (error) return { ok: false, error: error.message };
    setCaptaciones((prev) => prev.map((c) => (c.id === captacionId ? { ...c, disponibilidad } : c)));
    return { ok: true };
  }

  // Carga rápida: para propiedades que ya existen de verdad (documentadas en Drive, fuera
  // de Realtia) y no necesitan pasar por el wizard guiado de captación. Se crean
  // directamente como publicadas, con el checklist ya completo.
  async function crearPropiedadExistente(data) {
    const { data: row, error } = await supabase
      .from("realtia_captaciones")
      .insert({
        agente_id: agenteId,
        ...captacionToRow({
          estado: "publicada",
          disponibilidad: "disponible",
          checklist: nuevoChecklist(true),
          ...data,
        }),
      })
      .select().single();
    if (error) { console.error("crearPropiedadExistente", error); return { ok: false, error: error.message }; }
    setCaptaciones((prev) => [captacionFromRow(row), ...prev]);
    return { ok: true };
  }

  async function crearRequerimiento(data) {
    const { data: row, error } = await supabase
      .from("realtia_requerimientos")
      .insert({ agente_id: agenteId, ...requerimientoToRow({ estado: "activo", ...data }) })
      .select().single();
    if (error) { console.error("crearRequerimiento", error); return; }
    setRequerimientos((prev) => [requerimientoFromRow(row), ...prev]);
  }

  async function actualizarRequerimiento(id, datos) {
    const req = requerimientos.find((r) => r.id === id);
    if (!req) return { ok: false, error: "Requerimiento no encontrado" };
    const actualizado = { ...req, ...datos };
    const { error } = await supabase.from("realtia_requerimientos").update(requerimientoToRow(actualizado)).eq("id", id);
    if (error) { console.error("actualizarRequerimiento", error); return { ok: false, error: error.message }; }
    setRequerimientos((prev) => prev.map((r) => (r.id === id ? actualizado : r)));
    return { ok: true };
  }

  async function crearKyc(data) {
    const riesgo = calcularRiesgo(data);
    const { data: row, error } = await supabase
      .from("realtia_kyc")
      .insert({ agente_id: agenteId, ...kycToRow({ estado: "pendiente", puntajeRiesgo: riesgo.puntaje, nivelRiesgo: riesgo.nivel, ...data }) })
      .select().single();
    if (error) { console.error("crearKyc", error); return { ok: false, error: error.message }; }
    setKyc((prev) => [kycFromRow(row), ...prev]);
    return { ok: true, id: row.id };
  }

  async function actualizarKyc(id, datos) {
    const registro = kyc.find((k) => k.id === id);
    if (!registro) return { ok: false, error: "Registro no encontrado" };
    const actualizado = { ...registro, ...datos };
    const riesgo = calcularRiesgo(actualizado);
    actualizado.puntajeRiesgo = riesgo.puntaje;
    actualizado.nivelRiesgo = riesgo.nivel;
    const { error } = await supabase.from("realtia_kyc").update(kycToRow(actualizado)).eq("id", id);
    if (error) { console.error("actualizarKyc", error); return { ok: false, error: error.message }; }
    setKyc((prev) => prev.map((k) => (k.id === id ? actualizado : k)));
    return { ok: true };
  }

  // Screening contra la lista pública OFAC (función de Supabase, ver
  // supabase/functions/verificar-listas) — nunca decide sola, solo marca la coincidencia
  // para que la revise una persona antes de aprobar o rechazar.
  async function verificarListasKyc(id) {
    const registro = kyc.find((k) => k.id === id);
    if (!registro) return { ok: false, error: "Registro no encontrado" };
    const nombre = contactoNombre(registro.contactoId);
    try {
      const { data, error } = await supabase.functions.invoke("verificar-listas", { body: { nombre } });
      if (error) throw error;
      return actualizarKyc(id, {
        coincidenciaListas: !!data.coincidencia,
        detalleListas: data.resultados || [],
        verificadoEn: data.verificadoEn || new Date().toISOString(),
      });
    } catch (err) {
      console.error("verificarListasKyc", err);
      return { ok: false, error: "No se pudo consultar la lista de sanciones. Intenta de nuevo." };
    }
  }

  // Fotos de la propiedad: se suben al almacenamiento y la lista ordenada queda en la
  // captación (la primera es la portada). Solo el agente dueño de la captación puede
  // cambiarlas — lo impone el RLS del bucket y de la tabla.
  function reflejarFotos(captacionId, fotos) {
    const aplicar = (lista) => lista.map((c) => (c.id === captacionId ? { ...c, fotos } : c));
    setCaptaciones(aplicar);
    setPropiedadesOficina(aplicar);
  }

  async function agregarFotos(captacionId, archivos) {
    const cap = captaciones.find((c) => c.id === captacionId);
    if (!cap) return { ok: false, error: "Captación no encontrada" };
    const nuevas = [];
    try {
      for (const f of archivos) nuevas.push(await subirFoto(agenteId, captacionId, f));
    } catch (err) {
      console.error("agregarFotos", err);
      if (!nuevas.length) return { ok: false, error: "No se pudo subir la foto. Revisa tu conexión." };
    }
    const fotos = [...(cap.fotos || []), ...nuevas];
    const { error } = await supabase.from("realtia_captaciones").update({ fotos }).eq("id", captacionId);
    if (error) { console.error("agregarFotos", error); return { ok: false, error: error.message }; }
    reflejarFotos(captacionId, fotos);
    return { ok: true, subidas: nuevas.length, total: archivos.length };
  }

  async function quitarFoto(captacionId, path) {
    const cap = captaciones.find((c) => c.id === captacionId);
    if (!cap) return { ok: false };
    const fotos = (cap.fotos || []).filter((f) => f.path !== path);
    const { error } = await supabase.from("realtia_captaciones").update({ fotos }).eq("id", captacionId);
    if (error) { console.error("quitarFoto", error); return { ok: false, error: error.message }; }
    reflejarFotos(captacionId, fotos);
    borrarFoto(path).catch((err) => console.error("borrarFoto", err));
    return { ok: true };
  }

  async function usarComoPortada(captacionId, path) {
    const cap = captaciones.find((c) => c.id === captacionId);
    if (!cap) return;
    const elegida = (cap.fotos || []).find((f) => f.path === path);
    if (!elegida) return;
    const fotos = [elegida, ...cap.fotos.filter((f) => f.path !== path)];
    const { error } = await supabase.from("realtia_captaciones").update({ fotos }).eq("id", captacionId);
    if (error) { console.error("usarComoPortada", error); return; }
    reflejarFotos(captacionId, fotos);
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

  // Guarda el plan (borrador o completo). Al completarlo, la meta del plan pasa a ser la
  // meta del Coach: meta anual = meta monetaria y el precio promedio se ajusta para que
  // "cierres necesarios" coincida con las transacciones del plan.
  async function guardarPlan(datos) {
    const actual = plan || { anio: anioDelPlan() };
    const nuevo = { ...actual, ...datos };
    const { data: row, error } = await supabase
      .from("realtia_planes")
      .upsert({ agente_id: agenteId, ...planToRow(nuevo) }, { onConflict: "agente_id,anio" })
      .select().single();
    if (error) { console.error("guardarPlan", error); return { ok: false, error: error.message }; }
    const guardado = planFromRow(row);
    setPlan(guardado);
    if (guardado.completadoEn && guardado.metaMonetaria && guardado.comisionPromedio) {
      const pct = perfil?.comisionPromedioPct || 5;
      await actualizarMeta({ metaAnual: guardado.metaMonetaria, comisionPromedioPct: pct, precioPromedioVenta: Math.round(guardado.comisionPromedio / (pct / 100)) });
    }
    return { ok: true, plan: guardado };
  }

  // Guarda el resultado de una llamada (o WhatsApp) en un solo paso, como "Guardar y
  // siguiente" del modo Llamar: registra la interacción, da por hechas las llamadas
  // pendientes de ese contacto, agenda la próxima (llamada o cita) y actualiza el estado
  // de gestión del contacto. El asesor solo tocó botones.
  async function registrarLlamada({ contactoId, actividadId, canal, resultado, resultadoTexto, efectivo, nota, proximaFecha, cita, horaCita, estadoGestion, objetivos }) {
    const contacto = contactos.find((c) => c.id === contactoId);
    if (!contacto) return { ok: false, error: "Contacto no encontrado" };
    const R = RESULTADOS.find((r) => r.key === resultado);
    const ahora = new Date().toISOString();

    const { data: filaInter, error: errInter } = await supabase
      .from("realtia_interacciones")
      .insert({
        agente_id: agenteId, contacto_id: contactoId, actividad_id: actividadId || null, canal,
        resultado, resultado_texto: resultadoTexto || null, efectivo: !!efectivo, cita: !!cita, nota: nota || null,
      })
      .select().single();
    if (errInter) { console.error("registrarLlamada", errInter); return { ok: false, error: errInter.message }; }
    setInteracciones((prev) => [interaccionFromRow(filaInter), ...prev]);

    // Llamadas pendientes de este contacto que ya vencieron (o todas, si se agenda una
    // nueva) quedan completadas: no tiene sentido que sigan apareciendo en la cola.
    const finDeHoy = new Date(); finDeHoy.setHours(23, 59, 59, 999);
    const aCerrar = actividades.filter((a) => a.contactoId === contactoId && a.estado === "pendiente" && a.tipo === "llamada" && (new Date(a.fechaHora) <= finDeHoy || proximaFecha));
    const textoResultado = resultado === "otro" ? resultadoTexto : R?.label;
    if (aCerrar.length) {
      const ids = aCerrar.map((a) => a.id);
      await supabase.from("realtia_actividades").update({ estado: "completada", resultado: textoResultado }).in("id", ids);
      setActividades((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, estado: "completada", resultado: textoResultado } : a)));
    }

    if (estadoGestion === "no_contactar") {
      const pendientes = actividades.filter((a) => a.contactoId === contactoId && a.estado === "pendiente" && !aCerrar.some((x) => x.id === a.id));
      if (pendientes.length) {
        const ids = pendientes.map((a) => a.id);
        await supabase.from("realtia_actividades").update({ estado: "cancelada" }).in("id", ids);
        setActividades((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, estado: "cancelada" } : a)));
      }
    } else if (proximaFecha) {
      const [h, m] = (cita ? horaCita || "10:00" : HORA_LLAMADA_DEFECTO).split(":").map(Number);
      const [y, mes, d] = proximaFecha.split("-").map(Number);
      const fechaHora = new Date(y, mes - 1, d, h, m).toISOString();
      const primerNombre = contacto.nombre.split(" ")[0];
      await crearActividad({
        contactoId, oportunidadId: null,
        tipo: cita ? "reunion" : "llamada",
        titulo: cita ? `Cita con ${contacto.nombre}` : `Llamar a ${primerNombre}`,
        fechaHora, estado: "pendiente", duracion: cita ? 60 : null,
      });
    }

    const notaNueva = nota && nota.trim() ? [{ id: crypto.randomUUID(), fecha: ahora, texto: nota.trim() }] : [];
    await actualizarContacto(contactoId, {
      estadoGestion: estadoGestion || contacto.estadoGestion,
      objetivos: objetivos ?? contacto.objetivos,
      ultimaGestion: ahora,
      ultimoContacto: efectivo ? ahora : contacto.ultimoContacto,
      numeroIncorrecto: resultado === "incorrecto" || contacto.numeroIncorrecto,
      notas: [...notaNueva, ...(contacto.notas || [])],
    });
    return { ok: true };
  }

  // Importación masiva (CSV / Excel / .vcf ya leídos y sin duplicados): entran como "Sin
  // gestión" y quedan en la cola de Llamar.
  async function importarContactos(lista) {
    const filas = lista.map((c) => ({
      agente_id: agenteId,
      ...contactoToRow({ nombre: c.nombre, telefono: c.telefono, clasificacion: "contacto_relacion", estadoGestion: "sin_gestion", origen: "importado" }),
    }));
    const creados = [];
    for (let i = 0; i < filas.length; i += 200) {
      const { data, error } = await supabase.from("realtia_contactos").insert(filas.slice(i, i + 200)).select();
      if (error) { console.error("importarContactos", error); return { ok: false, error: error.message, creados: creados.length }; }
      creados.push(...data.map(contactoFromRow));
    }
    setContactos((prev) => [...creados, ...prev]);
    return { ok: true, creados: creados.length };
  }

  function abrirLlamar(contactoId) {
    setLlamarA(contactoId || null);
    setExpedienteId(null);
    setVista("llamar");
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
    else if (key === "requerimientos") setCrearRequerimientoAbierto(true);
    else if (key === "kyc") setCrearKycAbierto(true);
    else if (key === "contactos-todos") setVista("contactos");
    else if (key === "propiedades-ver") setVista("propiedades");
    else if (key === "prospeccion") abrirLlamar(null);
    else if (key === "importar") setImportarAbierto(true);
    else if (key === "captacion-ver") setVista("captacion");
    else if (key === "llamar" || key === "whatsapp" || key === "email") setContactarTipo(key);
  }

  const agency = {
    producto: agencyPorDefecto.producto,
    nombreOficina: perfil?.nombreOficina || agencyPorDefecto.nombreOficina,
    nombreAgente: perfil?.nombreAgente || agencyPorDefecto.nombreAgente,
    inicialAgente: (perfil?.nombreAgente || agencyPorDefecto.nombreAgente).charAt(0).toUpperCase(),
    ubicacion: perfil?.ubicacion || agencyPorDefecto.ubicacion,
    telefono: perfil?.telefono || "",
    plan: perfil?.plan || "basic",
    metaAnual: perfil?.metaAnual || null,
    comisionPromedioPct: perfil?.comisionPromedioPct || null,
    precioPromedioVenta: perfil?.precioPromedioVenta || null,
    rol: perfil?.rol || "asesor",
    oficinaId: perfil?.oficinaId || null,
  };

  async function actualizarPerfil(datos) {
    const { error } = await supabase
      .from("realtia_perfiles")
      .update({
        nombre_agente: datos.nombreAgente,
        nombre_oficina: datos.nombreOficina,
        ubicacion: datos.ubicacion,
        telefono: datos.telefono,
      })
      .eq("id", agenteId);
    if (error) { console.error("actualizarPerfil", error); return { ok: false, error: error.message }; }
    setPerfil((prev) => ({ ...prev, ...datos }));
    return { ok: true };
  }

  // La meta de negocio del agente (ingresos anuales + supuestos de comisión y precio
  // promedio) vive en el mismo perfil, pero es un concepto aparte de sus datos de
  // contacto — de ahí la función separada.
  async function actualizarMeta(datos) {
    const { error } = await supabase
      .from("realtia_perfiles")
      .update({
        meta_anual: datos.metaAnual,
        comision_promedio_pct: datos.comisionPromedioPct,
        precio_promedio_venta: datos.precioPromedioVenta,
      })
      .eq("id", agenteId);
    if (error) { console.error("actualizarMeta", error); return { ok: false, error: error.message }; }
    setPerfil((prev) => ({ ...prev, ...datos }));
    return { ok: true };
  }

  const value = {
    vista, setVista,
    cargando, errorCarga, recargarTodo, agency, signOut, actualizarPerfil, actualizarMeta,
    contactos, oportunidades, actividades, captaciones, requerimientos, kyc, interacciones,
    plan, guardarPlan,
    registrarLlamada, importarContactos, abrirLlamar, llamarA, setLlamarA, filtroContactos, setFiltroContactos,
    importarAbierto, setImportarAbierto,
    equipo, oficinaCartera, directorioOficina, propiedadesOficina,
    contactoNombre, nombreAgente, telefonoAgente, registrarContacto, agregarNota,
    crearContacto, actualizarContacto, crearOportunidad, actualizarOportunidad, agendarSeguimientoOportunidad, cerrarOportunidad,
    agregarFotos, quitarFoto, usarComoPortada, agenteId,
    crearCaptacion, actualizarCaptacion, toggleChecklistCaptacion, cambiarEstadoCaptacion, cambiarDisponibilidad, crearPropiedadExistente, guardarACM, guardarDescripcionIA,
    crearRequerimiento, actualizarRequerimiento,
    crearKyc, actualizarKyc, verificarListasKyc,
    crearActividad, completarActividad, reprogramarActividad, cancelarActividad,
    cargarDatosDemo,
    crearContactoAbierto, setCrearContactoAbierto,
    crearOportunidadAbierto, setCrearOportunidadAbierto,
    crearCaptacionAbierto, setCrearCaptacionAbierto,
    crearActividadAbierto, setCrearActividadAbierto,
    crearRequerimientoAbierto, setCrearRequerimientoAbierto,
    crearKycAbierto, setCrearKycAbierto,
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
