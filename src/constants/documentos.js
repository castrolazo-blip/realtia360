// Catálogo de documentos del proceso de venta/alquiler — mismo objetivo que las carpetas
// que hoy se llevan a mano en Drive, pero dentro de la oportunidad de cada cliente.
export const TIPO_DOCUMENTO_LABEL = {
  ficha_conocimiento_cliente: "Ficha de Conocimiento a tu Cliente",
  acuerdo_exclusiva: "Acuerdo de Exclusiva",
  acuerdo_promocion: "Acuerdo de Promoción",
  identificacion: "Identificación (DUI/Pasaporte)",
  comprobante_ingresos: "Comprobante de ingresos",
  comparativo_ingresos: "Comparativo de ingresos",
  otro: "Otro documento",
};

export const ESTADO_DOCUMENTO_LABEL = {
  pendiente: "Pendiente",
  subido: "Subido",
  aprobado: "Aprobado",
  rechazado: "Rechazado",
};
export const ESTADO_DOCUMENTO_TONE = {
  pendiente: "bg-gray-100 text-gray-600",
  subido: "bg-sky-100 text-sky-700",
  aprobado: "bg-brand-100 text-brand-700",
  rechazado: "bg-rose-100 text-rose-700",
};
export const ESTADOS_DOCUMENTO = Object.keys(ESTADO_DOCUMENTO_LABEL);

// Checklist base por tipo de oportunidad — heurística de plaza mientras se cargan los
// formatos reales de RE/MAX Expansion (Acuerdo de Exclusiva / de Promoción / Ficha de
// Conocimiento a tu Cliente). Cuando lleguen esos documentos, ajustar aquí el catálogo y,
// en una fase 2, el auto-llenado real de cada plantilla — por ahora este checklist solo
// registra qué documento falta y guarda el archivo que suba el asesor, sin generarlo.
const BASE = ["ficha_conocimiento_cliente", "identificacion", "comprobante_ingresos", "comparativo_ingresos"];
export const CHECKLIST_POR_TIPO_OPORTUNIDAD = {
  venta: [...BASE, "acuerdo_exclusiva"],
  captacion: [...BASE, "acuerdo_exclusiva"],
  compra: [...BASE, "acuerdo_promocion"],
  alquiler: [...BASE, "acuerdo_promocion"],
  inversion: [...BASE, "acuerdo_promocion"],
};
export const checklistDocumentos = (tipoOportunidad) => CHECKLIST_POR_TIPO_OPORTUNIDAD[tipoOportunidad] || BASE;
