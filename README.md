# Realtia

Plataforma para agentes y oficinas inmobiliarias: cartera de contactos (CRM), pipeline de
oportunidades, captación de propiedades (con diagnóstico Método DEC y Análisis Comparativo
de Mercado) y agenda. Pensada como producto comercializable por planes — **Basic / Gold /
Premium**.

## Por qué se reestructuró

La versión anterior vivía completa en un único `index.html` de ~2.950 líneas (React +
Babel + Tailwind, todo por CDN, sin build). Cualquier corrección obligaba a tocar ese mismo
archivo gigante. Esta versión es un proyecto Vite + React normal, con el código repartido en
módulos por responsabilidad — así una corrección en, por ejemplo, el wizard de captación no
implica volver a tocar (ni arriesgar) el resto de la app.

## Estructura

```
src/
  main.jsx                 Punto de entrada
  App.jsx                  Compone el shell + la vista activa + los modales globales
  index.css                Tailwind + tokens de marca

  config/                  agency.js (perfil del agente/oficina), plans.js (Basic/Gold/Premium), nav.js
  context/                 AppDataContext.jsx — estado de la cartera (contactos, oportunidades,
                            actividades, captaciones) y sus operaciones, disponible vía useAppData()
  hooks/                   useMediaQuery.js
  lib/                     dates.js, format.js, contacts.js (vCard, tel/WhatsApp/mailto), ids.js
  constants/                catálogos: contactos, oportunidades, actividades, captación,
                            espacios de la propiedad, pilares del Método DEC, calendario
  data/                    seed.js — datos de demostración en memoria

  components/
    icons/Icon.jsx          set de íconos SVG
    ui/                     Card, Badge, Button, Field, Modal, EmptyState, SectionHeader, Chip, PlanBadge
    shared/                 componentes usados por más de un módulo (ActividadCard, AccionModal,
                            ContactoQuickButtons, ContactarModal)

  layouts/
    AppShell.jsx            decide qué shell montar (móvil o escritorio)
    MobileShell.jsx         barra inferior de pestañas — estilo app nativa
    DesktopShell.jsx        sidebar oscuro + barra de búsqueda — estilo panel profesional

  features/
    inicio/                 pantalla de inicio (feed en móvil, dashboard en escritorio)
    contactos/               CRM + Círculo de Influencia
    oportunidades/           embudo de ventas
    captacion/                captación guiada (Método DEC), ACM, ficha imprimible, kanban
    agenda/                   lista + calendario de actividades
```

Los módulos de `features/` no reciben la cartera por props: consumen `useAppData()`
directamente, así que agregar o modificar una pantalla no implica tocar `App.jsx` ni
encadenar props por media docena de componentes.

## Mobile vs. escritorio

Son intencionalmente distintos, no la misma pantalla adaptada con CSS:

- **Móvil**: barra inferior de pestañas grandes, header compacto tipo app, cuadrícula de
  acciones rápidas — pensado para uso con el pulgar.
- **Escritorio**: sidebar fijo oscuro con marca y plan, barra de búsqueda superior, y un
  panel de inicio con indicadores (KPIs) en fila y contenido a dos columnas.

`AppShell` decide con JS (no solo `hidden`/`lg:block`) cuál de los dos montar, para que el
contenido y sus modales se rendericen una sola vez.

## Comercialización por planes

`src/config/plans.js` define Basic / Gold / Premium (con límites de referencia) y
`<PlanBadge />` los muestra en el sidebar. Por ahora es solo presentación: el control de
acceso real por plan y el login multi-usuario se conectan en la fase siguiente con Supabase
(ver más abajo).

## Pendiente para la fase 2 (no incluido aún)

- Autenticación y usuarios con Supabase (hoy `src/config/agency.js` es un perfil de
  demostración fijo; en la fase 2 vendrá de la sesión del agente).
- Control de acceso real por plan (bloquear funciones/límites según Basic, Gold o Premium).
- Persistencia real de datos (hoy todo vive en memoria vía `useState` y se reinicia al
  recargar — igual que en la versión anterior).
- Empaquetado como app de Android/iOS (esta base en Vite + React está lista para envolverse
  con Capacitor sin reescribir pantallas).

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción (carpeta dist/)
npm run preview   # sirve el build de producción localmente
```
