// Gestión diaria de prospección (modo Llamar). Todo se elige con botones: el asesor solo
// escribe si quiere dejar un comentario.

// En qué va la prospección con un contacto. Es distinto de la clasificación del contacto
// (que describe la relación: familia, cliente anterior, referidor…).
export const ESTADO_GESTION_LABEL = {
  sin_gestion: "Sin gestión",
  nuevo: "Nuevo",
  seguimiento: "En seguimiento",
  futuro: "Futuro",
  no_interesado: "No interesado",
  cerrado: "Cerrado",
  no_contactar: "No contactar",
};
export const ESTADOS_GESTION = Object.keys(ESTADO_GESTION_LABEL);
export const ESTADO_GESTION_TONE = {
  sin_gestion: "bg-gray-100 text-gray-600",
  nuevo: "bg-sky-100 text-sky-700",
  seguimiento: "bg-brand-100 text-brand-700",
  futuro: "bg-gold-100 text-gold-700",
  no_interesado: "bg-gray-100 text-gray-500",
  cerrado: "bg-indigo-100 text-indigo-700",
  no_contactar: "bg-rose-100 text-rose-700",
};
// Estados que sacan al contacto del ciclo (no entra a la cola ni cuenta en la rueda).
export const FUERA_DE_CICLO = ["no_interesado", "cerrado", "no_contactar"];

// Qué quiere hacer el contacto. "Prospecto" = tiene algo que vender o alquilar (alimenta
// captación); "comprador" = busca algo (alimenta requerimientos).
export const OBJETIVO_LABEL = {
  comprar: "Comprar",
  alquilar: "Alquilar (busca)",
  vender: "Vender",
  dar_alquiler: "Dar en alquiler",
};
export const OBJETIVOS = Object.keys(OBJETIVO_LABEL);
export const OBJETIVOS_PROSPECTO = ["vender", "dar_alquiler"];
export const OBJETIVOS_COMPRADOR = ["comprar", "alquilar"];

export const ORIGEN_LABEL = {
  mis_contactos: "Mis contactos",
  referido: "Referido",
  llamada_frio: "Llamada en frío",
  redes: "Redes sociales",
  rotulo_portal: "Rótulo o portal",
  importado: "Importado",
};

// Cómo salió la llamada. `efectivo` = sí se habló con la persona. `siguiente` = a cuántos
// días se propone la próxima llamada (null = sin próxima). `estado` = estado de gestión
// que se propone (el asesor lo puede cambiar con un toque).
export const RESULTADOS = [
  { key: "interesado", label: "Hablé · interesado", efectivo: true, siguiente: 3, estado: "seguimiento", tone: "border-l-brand-600" },
  { key: "no_interesado", label: "Hablé · no interesado", efectivo: true, siguiente: null, estado: "no_interesado", tone: "border-l-gray-400" },
  { key: "despues", label: "Llamar después", efectivo: true, siguiente: 3, estado: "seguimiento", tone: "border-l-gold-500" },
  { key: "no_respondio", label: "No respondió", efectivo: false, siguiente: 1, estado: null, tone: "border-l-rose-400" },
  { key: "incorrecto", label: "Número incorrecto", efectivo: false, siguiente: null, estado: null, tone: "border-l-gray-300" },
  { key: "otro", label: "Otro resultado", efectivo: true, siguiente: 3, estado: null, tone: "border-l-sky-500" },
];
export const RESULTADO_LABEL = Object.fromEntries(RESULTADOS.map((r) => [r.key, r.label]));

export const PROXIMA_OPCIONES = [
  { value: "1", label: "Mañana" },
  { value: "3", label: "3 días" },
  { value: "7", label: "7 días" },
  { value: "30", label: "30 días" },
  { value: "none", label: "Sin fecha" },
  { value: "custom", label: "Elegir fecha" },
];

export const HORAS_CITA = ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];
export const HORA_LLAMADA_DEFECTO = "09:00";

// Metas diarias de referencia para los indicadores de "Mi día".
export const METAS_DIA = { intentos: 25, efectivos: 10, citas: 3 };
