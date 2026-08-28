export const TIPO_DOCUMENTO_LABEL = { dui: "DUI", pasaporte: "Pasaporte", nit: "NIT", carnet_residente: "Carné de residente", otro: "Otro" };
export const TIPOS_DOCUMENTO = Object.keys(TIPO_DOCUMENTO_LABEL);

export const ORIGEN_FONDOS_LABEL = {
  salario: "Salario / ingresos laborales",
  ahorros: "Ahorros",
  venta_activo: "Venta de otro activo",
  herencia: "Herencia o donación",
  prestamo: "Préstamo / financiamiento",
  negocio_propio: "Utilidades de negocio propio",
  otro: "Otro",
};
export const ORIGENES_FONDOS = Object.keys(ORIGEN_FONDOS_LABEL);

export const FORMA_PAGO_LABEL = { efectivo: "Efectivo", transferencia: "Transferencia bancaria", cheque: "Cheque", financiamiento: "Financiamiento / banco" };
export const FORMAS_PAGO = Object.keys(FORMA_PAGO_LABEL);

export const ESTADO_KYC_LABEL = { pendiente: "Pendiente", en_revision: "En revisión", aprobado: "Aprobado", rechazado: "Rechazado" };
export const ESTADOS_KYC = Object.keys(ESTADO_KYC_LABEL);
export const ESTADO_KYC_TONE = {
  pendiente: "bg-gray-100 text-gray-600",
  en_revision: "bg-gold-100 text-gold-700",
  aprobado: "bg-brand-100 text-brand-700",
  rechazado: "bg-rose-100 text-rose-700",
};

export const NIVEL_RIESGO_LABEL = { bajo: "Riesgo bajo", medio: "Riesgo medio", alto: "Riesgo alto" };
export const NIVEL_RIESGO_TONE = {
  bajo: "bg-brand-100 text-brand-700",
  medio: "bg-gold-100 text-gold-700",
  alto: "bg-rose-100 text-rose-700",
};
