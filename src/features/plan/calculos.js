import { CONVERSION_DEFECTO, SEMANAS_LABORALES, DIAS_LABORALES } from "../../constants/plan.js";
import { METAS_DIA } from "../../constants/gestion.js";

// El cálculo del cuaderno — meta monetaria ÷ comisión promedio = transacciones — y de ahí
// el embudo hacia atrás: cuántas citas, contactos efectivos y llamadas hacen falta para
// llegar, repartido por mes, semana y día.
export function calcularMetasPlan(plan) {
  if (!plan?.metaMonetaria || !plan?.comisionPromedio) return null;
  const c = { ...CONVERSION_DEFECTO, ...(plan.conversion || {}) };
  const transacciones = Math.ceil(plan.metaMonetaria / plan.comisionPromedio);
  const citas = Math.ceil(transacciones / c.cierres);
  const efectivos = Math.ceil(citas / c.citas);
  const intentos = Math.ceil(efectivos / c.efectivos);
  const anual = { cierres: transacciones, citas, efectivos, intentos };
  const reparto = (div) => Object.fromEntries(Object.entries(anual).map(([k, v]) => [k, Math.max(1, Math.ceil(v / div))]));
  return {
    transacciones,
    anual,
    mes: reparto(12),
    semana: reparto(SEMANAS_LABORALES),
    dia: reparto(DIAS_LABORALES),
  };
}

export const planCompleto = (plan) => !!plan?.completadoEn;

// Metas de "Mi día" (intentos, efectivos, citas): salen del plan; si aún no hay plan, se
// usan las de referencia.
export function metasDelDia(plan) {
  const m = calcularMetasPlan(plan);
  return m ? { intentos: m.dia.intentos, efectivos: m.dia.efectivos, citas: m.dia.citas } : METAS_DIA;
}
