import { Icon } from "../components/icons/Icon.jsx";

// Navegación de un asesor: su cartera personal de trabajo diario.
export const NAV_ASESOR = [
  { key: "inicio", label: "Inicio", icon: Icon.Home },
  { key: "contactos", label: "Contactos", icon: Icon.Users },
  { key: "oportunidades", label: "Oportunidades", icon: Icon.Target },
  { key: "captacion", label: "Captación", icon: Icon.Clipboard },
  { key: "propiedades", label: "Propiedades", icon: Icon.Building },
  { key: "requerimientos", label: "Requerimientos", icon: Icon.ListSearch },
  { key: "agenda", label: "Agenda", icon: Icon.Calendar },
];
// Alias retrocompatible — la mayoría del código histórico importa NAV a secas.
export const NAV = NAV_ASESOR;

// Navegación del Broker: administrativa, no la cartera de un asesor. Ve la oficina
// completa (Office Pulse como inicio, equipo, producción, proyecciones, inventario) en vez
// de Contactos/Oportunidades/Captación/Agenda personales.
export const NAV_BROKER = [
  { key: "inicio", label: "Inicio", icon: Icon.Home },
  { key: "agentes", label: "Agentes", icon: Icon.Users },
  { key: "produccion", label: "Producción", icon: Icon.Crown },
  { key: "proyecciones", label: "Proyecciones", icon: Icon.TrendUp },
  { key: "propiedades", label: "Propiedades", icon: Icon.Building },
  { key: "administracion", label: "Administración", icon: Icon.Shield },
];

export const ACCIONES_RAPIDAS = [
  { key: "llamar", label: "Llamar", icon: Icon.Phone, accent: "bg-brand-50 text-brand-700" },
  { key: "whatsapp", label: "WhatsApp", icon: Icon.Whatsapp, accent: "bg-brand-50 text-brand-700" },
  { key: "email", label: "Correo", icon: Icon.Mail, accent: "bg-sky-50 text-sky-700" },
  { key: "agenda", label: "Nueva\nactividad", icon: Icon.Calendar, accent: "bg-gold-50 text-gold-700" },
  { key: "contactos", label: "Nuevo\ncontacto", icon: Icon.Users, accent: "bg-brand-50 text-brand-700" },
  { key: "oportunidades", label: "Nueva\noportunidad", icon: Icon.Target, accent: "bg-brand-50 text-brand-700" },
  { key: "captacion", label: "Nueva\ncaptación", icon: Icon.Clipboard, accent: "bg-orange-50 text-orange-700" },
  { key: "requerimientos", label: "Nuevo\nrequerimiento", icon: Icon.ListSearch, accent: "bg-indigo-50 text-indigo-700" },
  { key: "propiedades-ver", label: "Ver\npropiedades", icon: Icon.Building, accent: "bg-gray-100 text-gray-600" },
  { key: "contactos-todos", label: "Ver\ncontactos", icon: Icon.Search, accent: "bg-gray-100 text-gray-600" },
];

// El móvil no muestra los 7 módulos del asesor en la barra inferior (ver README) —
// Propiedades y Requerimientos siguen a un toque de distancia desde los accesos rápidos de
// Inicio. El Broker tiene solo 6 módulos en total, así que sí caben todos.
export const NAV_MOVIL_ASESOR = NAV_ASESOR.filter((item) => item.key !== "propiedades" && item.key !== "requerimientos");
export const NAV_MOVIL = NAV_MOVIL_ASESOR;
export const NAV_MOVIL_BROKER = NAV_BROKER;
