// Set de íconos de línea, dibujados a mano en SVG (sin dependencias externas).
export const Icon = {
  Home: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 11 12 4l8 7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10v9h12v-9" />
    </svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path strokeLinecap="round" d="M2.8 19c.9-3.3 3.3-5 6.2-5s5.3 1.7 6.2 5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path strokeLinecap="round" d="M15.9 14.3c2.4.2 4.1 1.8 4.8 4.4" />
    </svg>
  ),
  Target: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.6" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  Building: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="4" y="3.5" width="11" height="17" rx="1.2" />
      <path strokeLinecap="round" d="M15 20v-6.5h5V20M7.5 7.5h1.5M11 7.5h1.5M7.5 11h1.5M11 11h1.5M7.5 14.5h1.5M11 14.5h1.5" />
    </svg>
  ),
  ListSearch: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" d="M4 6h9M4 11h6" />
      <circle cx="15.5" cy="15.5" r="4" />
      <path strokeLinecap="round" d="m19.5 19.5 2.3 2.3" />
    </svg>
  ),
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="3.3" y="4.8" width="17.4" height="15.4" rx="2.2" />
      <path strokeLinecap="round" d="M3.3 9.6h17.4M8 3v3.4M16 3v3.4" />
    </svg>
  ),
  Search: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="11" cy="11" r="6.5" />
      <path strokeLinecap="round" d="m20 20-4.3-4.3" />
    </svg>
  ),
  Filter: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  ),
  Pin: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  ),
  Bell: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10Z" />
      <path strokeLinecap="round" d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  ),
  Chevron: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 6 6 6-6 6" />
    </svg>
  ),
  ChevronDown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.5 9.5 17.5 19.5 6.5" />
    </svg>
  ),
  Shield: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3.5 19 6v6c0 4.5-3 7.5-7 8.5-4-1-7-4-7-8.5V6l7-2.5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4.3" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path strokeLinecap="round" d="M12 7.5V12l3 2" />
    </svg>
  ),
  Sync: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 0 1 13.7-5.7L20 8.5M20 12a8 8 0 0 1-13.7 5.7L4 15.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 4.5v4h-4M4 19.5v-4h4" />
    </svg>
  ),
  Bolt: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 3 5 13.5h5.5L11 21l7.5-10.5H13L12.5 3Z" />
    </svg>
  ),
  Plus: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...p}>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  ),
  Phone: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.5 3.8 9 5.6a1.4 1.4 0 0 1 .4 1.8L8 9.9c1 2.3 2.8 4.1 5.1 5.1l2.5-1.4a1.4 1.4 0 0 1 1.8.4l1.8 2.5a1.4 1.4 0 0 1-.2 1.9c-1 .9-2.3 1.4-3.6 1.1C10.6 18.6 5.4 13.4 4.6 8.6c-.3-1.3.2-2.6 1.1-3.6.5-.5 1.3-.7 1.9-.2Z"
      />
    </svg>
  ),
  File: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 3.5h7l4 4V20a.7.7 0 0 1-.7.7H7a.7.7 0 0 1-.7-.7V4.2a.7.7 0 0 1 .7-.7Z" />
      <path strokeLinecap="round" d="M9.5 12h5M9.5 15.3h5" />
    </svg>
  ),
  User: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <circle cx="12" cy="8.3" r="3.4" />
      <path strokeLinecap="round" d="M4.8 20c1-3.6 3.6-5.5 7.2-5.5s6.2 1.9 7.2 5.5" />
    </svg>
  ),
  Whatsapp: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M12 2.5a9.4 9.4 0 0 0-8.1 14.2L2.6 21l4.4-1.3A9.4 9.4 0 1 0 12 2.5Zm5.5 13.3c-.2.6-1.3 1.2-1.8 1.3-.5.1-1 .1-3.3-.7-2.8-1.1-4.6-3.9-4.7-4.1-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.3c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5.2.6.7 1.9.8 2 .1.2.1.3 0 .5-.1.2-.1.3-.3.5-.1.2-.3.4-.4.5-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.2 2.4 1.5 2.7 1.7.3.2.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.2.6-.1.2.1 1.6.8 1.9 1 .3.1.5.2.5.3.1.2.1.6-.1 1.2Z" />
    </svg>
  ),
  Mail: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="3.3" y="5" width="17.4" height="14" rx="2.2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.3 6.2 7.7 6 7.7-6" />
    </svg>
  ),
  Clipboard: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <rect x="5" y="4.3" width="14" height="16.4" rx="2" />
      <path strokeLinecap="round" d="M9 4v-.3a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 3.7V4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.5 13.2 2 2 4.5-4.7" />
    </svg>
  ),
  Sparkle: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
    </svg>
  ),
  Crown: (p) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.5 8 3 2.2L12 4l5.5 6.2 3-2.2-1.4 9.5h-14L3.5 8Z" />
      <path strokeLinecap="round" d="M6.5 19.7h11" />
    </svg>
  ),
};

export const TIPO_ICON = {
  llamada: Icon.Phone,
  reunion: Icon.Users,
  visita: Icon.Home,
  captacion: Icon.Home,
  seguimiento: Icon.Phone,
  informe: Icon.File,
  documento: Icon.File,
  tarea: Icon.Check,
};
