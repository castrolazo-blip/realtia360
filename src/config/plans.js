// Definición de los planes comerciales de Realtia. Hoy son solo datos de presentación
// (badge de plan, límites informativos); el control de acceso real por plan llega en la
// Fase 2 junto con la autenticación de Supabase (tabla `suscripciones`).
export const PLANES = {
  basic: {
    id: "basic",
    nombre: "Basic",
    tagline: "Para empezar a ordenar tu cartera",
    color: "gray",
    limites: { contactos: 100, captaciones: 5 },
  },
  gold: {
    id: "gold",
    nombre: "Gold",
    tagline: "Para agentes activos que captan seguido",
    color: "amber",
    limites: { contactos: 1000, captaciones: 50 },
  },
  premium: {
    id: "premium",
    nombre: "Premium",
    tagline: "Cartera, captación y ACM sin límites",
    color: "gold",
    limites: { contactos: Infinity, captaciones: Infinity },
  },
};

export const ORDEN_PLANES = ["basic", "gold", "premium"];
