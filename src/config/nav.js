import { Icon } from "../components/icons/Icon.jsx";

export const NAV = [
  { key: "inicio", label: "Inicio", icon: Icon.Home },
  { key: "contactos", label: "Contactos", icon: Icon.Users },
  { key: "oportunidades", label: "Oportunidades", icon: Icon.Target },
  { key: "captacion", label: "Captación", icon: Icon.Clipboard },
  { key: "propiedades", label: "Propiedades", icon: Icon.Building },
  { key: "requerimientos", label: "Requerimientos", icon: Icon.ListSearch },
  { key: "agenda", label: "Agenda", icon: Icon.Calendar },
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

// El móvil no muestra los 7 módulos en la barra inferior (ver README) — Propiedades y
// Requerimientos siguen a un toque de distancia desde los accesos rápidos de Inicio.
export const NAV_MOVIL = NAV.filter((item) => item.key !== "propiedades" && item.key !== "requerimientos");
