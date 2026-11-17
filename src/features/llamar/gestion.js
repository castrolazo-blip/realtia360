import { FUERA_DE_CICLO, OBJETIVOS_PROSPECTO, OBJETIVOS_COMPRADOR } from "../../constants/gestion.js";

// Reglas de la gestión diaria. Sin IA: todo es explicable y se calcula en el navegador
// con los datos que ya trae la app.

export const enCiclo = (c) => !FUERA_DE_CICLO.includes(c.estadoGestion) && !c.numeroIncorrecto;
export const esProspecto = (c) => (c.objetivos || []).some((o) => OBJETIVOS_PROSPECTO.includes(o));
export const esComprador = (c) => (c.objetivos || []).some((o) => OBJETIVOS_COMPRADOR.includes(o));

const finDeHoy = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; };
const inicioDeHoy = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

export function fechaLocal(offsetDias = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Cola de llamadas, en este orden:
//  1. llamadas agendadas vencidas o para hoy;
//  2. contactos que nunca se han gestionado (los más antiguos primero).
// Solo entran contactos en ciclo y con teléfono.
export function armarCola(contactos, actividades, saltados = new Set(), prioritarios = []) {
  const prioridad = new Set(prioritarios || []);
  const porId = new Map(contactos.map((c) => [c.id, c]));
  const fin = finDeHoy();
  const vistos = new Set();
  const cola = [];
  const pendientes = actividades.filter((a) => a.estado === "pendiente");

  pendientes
    .filter((a) => a.tipo === "llamada" && a.contactoId && new Date(a.fechaHora) <= fin)
    .sort((a, b) => a.fechaHora.localeCompare(b.fechaHora))
    .forEach((a) => {
      const c = porId.get(a.contactoId);
      if (c && !vistos.has(c.id) && enCiclo(c) && c.telefono) {
        vistos.add(c.id);
        cola.push({ contactoId: c.id, actividadId: a.id, vencida: new Date(a.fechaHora) < inicioDeHoy() });
      }
    });

  const conPendiente = new Set(pendientes.map((a) => a.contactoId));
  // Clientes del plan ("pueden cerrar este año") sin llamada agendada y sin gestión en 7
  // días: van antes que el resto de contactos sin gestionar.
  const hace7 = Date.now() - 7 * 86400000;
  contactos
    .filter((c) => prioridad.has(c.id) && !vistos.has(c.id) && enCiclo(c) && c.telefono && !conPendiente.has(c.id) && (!c.ultimaGestion || new Date(c.ultimaGestion).getTime() < hace7))
    .forEach((c) => { vistos.add(c.id); cola.push({ contactoId: c.id, actividadId: null, vencida: false, prioritario: true }); });
  contactos
    .filter((c) => !vistos.has(c.id) && enCiclo(c) && c.telefono && !c.ultimaGestion && !conPendiente.has(c.id))
    .sort((a, b) => (a.creadoEn || "").localeCompare(b.creadoEn || ""))
    .forEach((c) => cola.push({ contactoId: c.id, actividadId: null, vencida: false }));

  return cola.filter((x) => !saltados.has(x.contactoId));
}

// Indicadores de gestión de un periodo: intentos, contactos efectivos y citas.
export function indicadoresGestion(interacciones, desde = inicioDeHoy()) {
  const enPeriodo = interacciones.filter((i) => new Date(i.creadoEn) >= desde);
  const intentos = enPeriodo.length;
  const efectivos = enPeriodo.filter((i) => i.efectivo).length;
  const citas = enPeriodo.filter((i) => i.cita).length;
  return { intentos, efectivos, citas };
}

export function inicioDeSemana() {
  const d = inicioDeHoy();
  const dow = d.getDay() || 7; // lunes = 1
  d.setDate(d.getDate() - dow + 1);
  return d;
}

// El círculo virtuoso: las 4 etapas por las que pasa cada negocio. Se arma con lo que
// ya existe en Realtia, sin tablas nuevas:
//  1. Búsqueda — prospectos (quieren vender o dar en alquiler) y compradores (quieren
//     comprar/alquilar, tienen un requerimiento activo o una oportunidad recién abierta).
//  2. Captación formal — captaciones en proceso o publicadas y disponibles.
//  3. Negociación — oportunidades activas en visitas o negociación.
//  4. Cierre — oportunidades activas en etapa de cierre.
export function calcularCirculo({ contactos, requerimientos, captaciones, oportunidades }) {
  const activos = contactos.filter(enCiclo);
  const prospectos = new Set(activos.filter(esProspecto).map((c) => c.id));
  const compradores = new Set(activos.filter(esComprador).map((c) => c.id));
  for (const r of requerimientos) if (r.estado === "activo" && r.contactoId) compradores.add(r.contactoId);
  const opsActivas = oportunidades.filter((o) => o.estado === "activa");
  for (const o of opsActivas) {
    if ((o.etapa === "nueva" || o.etapa === "calificacion") && o.contactoId) {
      if (o.tipo === "venta" || o.tipo === "captacion") prospectos.add(o.contactoId);
      else compradores.add(o.contactoId);
    }
  }
  const busqueda = new Set([...prospectos, ...compradores]).size;
  const captacion = captaciones.filter((c) => c.estado !== "publicada" || (c.disponibilidad || "disponible") === "disponible").length;
  const negociacion = opsActivas.filter((o) => o.etapa === "visitas" || o.etapa === "negociacion").length;
  const cierre = opsActivas.filter((o) => o.etapa === "cierre").length;

  return [
    { key: "busqueda", numero: 1, titulo: "Búsqueda", subtitulo: "de propiedades", total: busqueda, detalle: [`${prospectos.size} ${prospectos.size === 1 ? "prospecto" : "prospectos"}`, `${compradores.size} ${compradores.size === 1 ? "comprador" : "compradores"}`] },
    { key: "captacion", numero: 2, titulo: "Captación", subtitulo: "formal", total: captacion, detalle: [] },
    { key: "negociacion", numero: 3, titulo: "Negociación", subtitulo: "", total: negociacion, detalle: [] },
    { key: "cierre", numero: 4, titulo: "Cierre", subtitulo: "transacción", total: cierre, detalle: [] },
  ];
}
