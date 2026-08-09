// Perfil del agente/oficina que usa Realtia. En esta fase es un objeto de configuración
// local (datos de demo); en la Fase 2 este perfil vendrá de la sesión de Supabase
// (tabla `agentes` / `oficinas`), una vez conectado el login multi-usuario.
export const agency = {
  producto: "Realtia",
  nombreOficina: "Oficina demo",
  nombreAgente: "Agente demo",
  inicialAgente: "A",
  ubicacion: "San Salvador, El Salvador",
  plan: "premium", // 'basic' | 'gold' | 'premium' — ver config/plans.js
};
