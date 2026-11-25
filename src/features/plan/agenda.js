// Agenda en bloques fijos que sale del plan: cada bloque es una cita del asesor consigo
// mismo (prospectar, dar seguimiento, citas, redes…). Se arma sola a partir de las metas
// del plan y luego se ajusta con toques.

export const TIPOS_BLOQUE = {
  prospeccion: { label: "Prospección", detalle: "Llamadas a contactos nuevos", color: "#c8173c", accion: "llamar" },
  seguimiento: { label: "Llamadas de seguimiento", detalle: "Retomar contactos pendientes", color: "#e0402c", accion: "llamar" },
  redes: { label: "Redes sociales", detalle: "Crear y publicar contenido", color: "#7a3fc2" },
  citas: { label: "Citas de captación", detalle: "Visitas a propietarios", color: "#0c5941", accion: "agenda" },
  recorridos: { label: "Recorridos con compradores", detalle: "Mostrar propiedades", color: "#0f8a95", accion: "agenda" },
  reunion: { label: "Reunión de oficina", detalle: "Junta del equipo", color: "#25389a" },
  admin: { label: "Administrativo", detalle: "Fichas, fotos y publicaciones", color: "#b86e00", accion: "captacion" },
  capacitacion: { label: "Capacitación", detalle: "Formación y estudio", color: "#1d8148" },
  revision: { label: "Revisión de mi plan", detalle: "Comparar avance contra metas", color: "#0a0f14", accion: "plan" },
  otro: { label: "Otra actividad", detalle: "Actividad personal", color: "#4d5b78" },
};
export const OTRAS_SUGERIDAS = ["Almuerzo", "Tiempo en familia", "Gimnasio", "Llevar a los niños al colegio", "Iglesia", "Estudio"];

export const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
export const DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0];

export const aMin = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
export const deMin = (m) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const hora12 = (h) => { let [a, b] = h.split(":").map(Number); const ap = a >= 12 ? "pm" : "am"; a = a % 12 || 12; return `${a}${b ? `:${String(b).padStart(2, "0")}` : ""} ${ap}`; };
export const tituloBloque = (b) => (b.tipo === "otro" && b.nombre ? b.nombre : (TIPOS_BLOQUE[b.tipo] || TIPOS_BLOQUE.otro).label);

const nuevoId = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));

// Semana sugerida. La prospección dura lo que piden las llamadas diarias del plan (unos 5
// minutos por llamada, redondeado a media hora, entre 1 y 3 horas).
export function generarAgenda({ dias = [1, 2, 3, 4, 5], inicio = "08:00", llamadasDia = 5, diaReunion = 2, revision }) {
  const S = aMin(inicio);
  const prosp = Math.min(180, Math.max(60, Math.ceil((llamadasDia * 5) / 30) * 30));
  const bloques = [];
  // La revisión del plan va a la hora que eligió el asesor; si otro bloque cae encima, ese
  // bloque se corre para después de la revisión.
  const rev = revision?.dia != null && revision?.hora ? { dia: revision.dia, ini: aMin(revision.hora), fin: aMin(revision.hora) + 30 } : null;
  const add = (dia, ini, dur, tipo, extra = {}) => {
    if (rev && dia === rev.dia && ini < rev.fin && ini + dur > rev.ini) ini = rev.fin;
    bloques.push({ id: nuevoId(), dia, ini: deMin(ini), fin: deMin(ini + dur), tipo, ...extra });
    return ini + dur;
  };

  for (const d of dias) {
    if (d === 6 || d === 0) { add(d, Math.max(S, 9 * 60), 180, "recorridos"); continue; }
    let t = S;
    if (d === diaReunion) t = add(d, t, 120, "reunion");
    else if (d === 1 || d === 3 || d === 5) t = add(d, t, 60, "redes");
    t = add(d, t, prosp, "prospeccion", { meta: llamadasDia });
    if (t + 60 <= 13 * 60) add(d, t, 60, "seguimiento");
    const tarde = 14 * 60;
    if (d === 1 || d === 3) add(d, tarde, 120, "citas");
    else if (d === 2 || d === 4) add(d, tarde, 120, "recorridos");
    else if (d === 5) { const t2 = add(d, tarde, 60, "capacitacion"); add(d, t2, 60, "admin"); }
  }
  if (rev) bloques.push({ id: nuevoId(), dia: rev.dia, ini: deMin(rev.ini), fin: deMin(rev.fin), tipo: "revision" });
  return ordenar(bloques);
}

export const ordenar = (bloques) => [...bloques].sort((a, b) => ORDEN_SEMANA.indexOf(a.dia) - ORDEN_SEMANA.indexOf(b.dia) || aMin(a.ini) - aMin(b.ini));
export const bloquesDelDia = (bloques, dia) => ordenar((bloques || []).filter((b) => b.dia === dia));

export function horasPorTipo(bloques) {
  const h = {};
  for (const b of bloques || []) h[b.tipo] = (h[b.tipo] || 0) + (aMin(b.fin) - aMin(b.ini)) / 60;
  return Object.entries(h).sort((a, b) => b[1] - a[1]);
}

// El bloque que toca ahora y el siguiente del día.
export function bloqueActual(bloques, ahora = new Date()) {
  const hoy = bloquesDelDia(bloques, ahora.getDay());
  const m = ahora.getHours() * 60 + ahora.getMinutes();
  return {
    actual: hoy.find((b) => aMin(b.ini) <= m && m < aMin(b.fin)) || null,
    siguiente: hoy.find((b) => aMin(b.ini) > m) || null,
  };
}

export const choques = (bloques, nuevo) =>
  (bloques || []).filter((b) => b.id !== nuevo.id && b.dia === nuevo.dia && aMin(b.ini) < aMin(nuevo.fin) && aMin(b.fin) > aMin(nuevo.ini));

// Seguimiento del plan
export const INDICADORES = {
  llamadas: "Llamadas",
  efectivos: "Contactos efectivos",
  citas: "Citas",
  captaciones: "Captaciones",
  cierres: "Cierres",
  comision: "Comisión cobrada",
};
export const REVISION_MENSUAL = {
  primer_lunes: "Primer lunes del mes",
  dia_1: "Día 1 de cada mes",
  ultimo_viernes: "Último viernes del mes",
  ninguna: "No por ahora",
};
export const HORAS_REVISION = ["07:00", "08:00", "12:00", "17:00", "18:00", "19:00"];
export const SEGUIMIENTO_DEFECTO = { dia: 1, hora: "08:00", mensual: "primer_lunes", indicadores: ["llamadas", "efectivos", "citas", "captaciones", "cierres"] };
