export const TIPO_INMUEBLE_LABEL = { casa: "Casa", apartamento: "Apartamento", terreno: "Terreno", local: "Local comercial", oficina: "Oficina" };

// El Salvador mide terreno en varas² comúnmente (además de m²); la construcción siempre en m².
export const UNIDAD_TERRENO_LABEL = { m2: "m²", varas2: "varas²" };
export const VARA2_A_M2 = 0.698896; // 1 vara² ≈ 0.698896 m² (vara salvadoreña de 0.8359 m)
export const areaTerrenoEnM2 = (valor, unidad) => (valor == null ? null : unidad === "varas2" ? valor * VARA2_A_M2 : valor);
export const areaTerrenoEnVaras2 = (valor, unidad) => (valor == null ? null : unidad === "m2" ? valor / VARA2_A_M2 : valor);

export const OPERACION_INMUEBLE_LABEL = { venta: "Venta", alquiler: "Alquiler" };

export const ESTADO_CAPTACION_LABEL = {
  borrador: "Borrador",
  entrevista: "Entrevista realizada",
  documentos_pendientes: "Documentos pendientes",
  revision: "En revisión",
  aprobada: "Aprobada",
  publicada: "Publicada",
};
export const ESTADOS_CAPTACION = Object.keys(ESTADO_CAPTACION_LABEL);
export const ESTADO_CAPTACION_TONE = {
  borrador: "bg-gray-100 text-gray-600",
  entrevista: "bg-gold-100 text-gold-700",
  documentos_pendientes: "bg-orange-100 text-orange-700",
  revision: "bg-sky-100 text-sky-700",
  aprobada: "bg-brand-100 text-brand-700",
  publicada: "bg-indigo-100 text-indigo-700",
};

export const CHECKLIST_BASE = [
  "Escritura o título de propiedad",
  "Fotografías de la propiedad",
  "Recibo de agua o luz reciente",
  "DUI del propietario",
  "Solvencia municipal",
];
export const nuevoChecklist = (completado = false) => CHECKLIST_BASE.map((nombre, i) => ({ id: `chk${i}`, nombre, completado }));

// Disponibilidad de una propiedad ya publicada — espejo de las carpetas "Venta / Alquiler /
// Propiedades Reservadas / Propiedades Cerradas / Propiedades No Disponibles" que ya usa la
// oficina en Drive. Es independiente del pipeline de captación (ESTADO_CAPTACION): una
// propiedad publicada sigue en el inventario aunque ya esté cerrada o retirada.
export const DISPONIBILIDAD_LABEL = {
  disponible: "Disponible",
  reservada: "Reservada",
  cerrada: "Cerrada",
  no_disponible: "No disponible",
};
export const DISPONIBILIDADES = Object.keys(DISPONIBILIDAD_LABEL);
export const DISPONIBILIDAD_TONE = {
  disponible: "bg-brand-100 text-brand-700",
  reservada: "bg-gold-100 text-gold-700",
  cerrada: "bg-black/10 text-black/50",
  no_disponible: "bg-rose-100 text-rose-700",
};
