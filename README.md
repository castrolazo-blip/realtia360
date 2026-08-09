# Realtia

Plataforma para agentes y oficinas inmobiliarias: cartera de contactos (CRM), pipeline de
oportunidades, captación de propiedades (con diagnóstico Método DEC y Análisis Comparativo
de Mercado) y agenda. Pensada como producto comercializable por planes — **Basic / Gold /
Premium**. Cuenta con login por agente y persistencia real en Supabase.

## Por qué se reestructuró

La versión original vivía completa en un único `index.html` de ~2.950 líneas (React + Babel
+ Tailwind, todo por CDN, sin build, datos solo en memoria). Cualquier corrección obligaba a
tocar ese mismo archivo gigante, y nada se guardaba entre sesiones. Esta versión es un
proyecto Vite + React normal, con el código repartido en módulos por responsabilidad y con
Supabase como base de datos real.

## Estructura

```
src/
  main.jsx                 Punto de entrada
  App.jsx                  Auth gate (login o app) + shell + vista activa + modales globales
  index.css                Tailwind + tokens de marca

  config/                  agency.js (perfil por defecto), plans.js (Basic/Gold/Premium),
                            nav.js, supabase.js (URL + clave pública del proyecto)
  context/
    AuthContext.jsx         sesión de Supabase Auth (signIn/signUp/signOut) vía useAuth()
    AppDataContext.jsx       cartera + perfil del agente, respaldados por Supabase,
                            disponible vía useAppData()
  hooks/                   useMediaQuery.js
  lib/
    dates.js, format.js, contacts.js (vCard, tel/WhatsApp/mailto), ids.js
    supabaseClient.js       cliente de Supabase (createClient)
    db/mappers.js           traduce entre columnas de Supabase (snake_case) y los objetos
                            que usa la UI (camelCase) — el único lugar que conoce ambos formatos
  constants/                catálogos: contactos, oportunidades, actividades, captación,
                            espacios de la propiedad, pilares del Método DEC, calendario
  data/                    seed.js — cartera de ejemplo, usada solo para "Cargar datos de
                            ejemplo" en una cuenta nueva (ya no se carga sola al abrir la app)

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
    auth/LoginScreen.jsx     pantalla de inicio de sesión / registro
    inicio/                 pantalla de inicio (feed en móvil, dashboard en escritorio)
    contactos/               CRM + Círculo de Influencia
    oportunidades/           embudo de ventas
    captacion/                captación guiada (Método DEC), ACM, ficha imprimible, kanban
    agenda/                   lista + calendario de actividades
```

Los módulos de `features/` no reciben la cartera por props: consumen `useAppData()` (datos) y
`useAuth()` (sesión) directamente, así que agregar o modificar una pantalla no implica tocar
`App.jsx` ni encadenar props por media docena de componentes.

## Mobile vs. escritorio

Son intencionalmente distintos, no la misma pantalla adaptada con CSS:

- **Móvil**: barra inferior de pestañas grandes, header compacto tipo app, cuadrícula de
  acciones rápidas — pensado para uso con el pulgar.
- **Escritorio**: sidebar fijo oscuro con marca y plan, barra de búsqueda superior, y un
  panel de inicio con indicadores (KPIs) en fila y contenido a dos columnas.

`AppShell` decide con JS (no solo `hidden`/`lg:block`) cuál de los dos montar, para que el
contenido y sus modales se rendericen una sola vez.

## Autenticación y datos (Supabase)

Cada agente inicia sesión con correo y contraseña (`features/auth/LoginScreen.jsx`); al
registrarse se crea automáticamente su perfil (nombre, oficina, ubicación, plan) mediante un
trigger de Postgres. Toda su cartera vive en Supabase, protegida por Row Level Security: cada
fila pertenece a un `agente_id` y las políticas solo dejan ver/editar las propias, así que un
agente nunca puede ver los datos de otro.

**Tablas** (proyecto Supabase, prefijo `realtia_` — ver nota abajo):
`realtia_perfiles`, `realtia_contactos`, `realtia_oportunidades`, `realtia_actividades`,
`realtia_captaciones`. El perfil de plan (`basic` / `gold` / `premium`) vive en
`realtia_perfiles.plan`.

**Nota sobre el proyecto de Supabase usado:** por un límite de proyectos gratuitos en la
cuenta, estas tablas viven dentro del proyecto Supabase existente `sport-car-system` (otro
sistema de negocio del propietario), aisladas por el prefijo `realtia_` y con sus propias
políticas de RLS — no comparten tablas ni datos con ese sistema. Si en el futuro se libera un
proyecto propio (o se sube de plan), migrar es solo correr el mismo script de migración en el
proyecto nuevo y actualizar `src/config/supabase.js` (o las variables de entorno
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`).

**Hallazgo de seguridad, sin relación con Realtia:** al revisar ese proyecto se detectó que
50 tablas preexistentes de `sport-car-system` tienen Row Level Security desactivado (cualquiera
con la clave pública del proyecto podría leer/modificarlas). No se tocó — es un tema aparte
del dueño del proyecto, pero queda documentado aquí para que no se pierda.

**Límite de pruebas en este entorno:** el sandbox donde se desarrolló esta fase bloquea el
acceso saliente al dominio de la API de Supabase, así que el flujo de registro/login no pudo
probarse en vivo desde aquí (sí se verificó el esquema, las políticas de RLS y los advisors de
seguridad directamente en la base de datos). Antes de dar por buena la fase 2, prueba una vez
en local (`npm run dev`) o ya desplegado: crear una cuenta, cerrar sesión, volver a entrar y
confirmar que la cartera persiste.

## Descripción de propiedades con IA

En la Ficha de propiedad hay un botón **"Generar con IA"** que redacta una publicación lista
para copiar en Instagram/Facebook (titular, cuerpo y hashtags) a partir de los datos ya
capturados de la propiedad. El texto queda guardado en `realtia_captaciones.descripcion_ia`
y se puede editar a mano (se guarda solo al salir del campo) o volver a generar.

La llamada a la IA **no se hace desde el navegador** — iría expuesta la clave de la API. En su
lugar, el navegador llama a una función de Supabase (`supabase/functions/generar-descripcion`,
ya desplegada) que a su vez llama a la API de Claude con una clave guardada como secreto del
proyecto, nunca visible en el código del cliente.

**Paso pendiente para activarlo:** hay que cargar la clave de la API de Anthropic como secreto
del proyecto de Supabase (yo no tengo forma de hacerlo por seguridad — un agente no debe tener
acceso a subir secretos). Con la CLI de Supabase:

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref ivvjbuhppuwpgefwqpuz
```

o desde el dashboard: **Project Settings → Edge Functions → Manage secrets**. Mientras no esté
configurada, el botón "Generar con IA" muestra un mensaje de error indicándolo, sin romper el
resto de la app.

## Comercialización por planes

`src/config/plans.js` define Basic / Gold / Premium (con límites de referencia) y
`<PlanBadge />` los muestra en el sidebar, tomando el plan real del perfil del agente. El
control de acceso — bloquear funciones o límites según el plan — todavía no está conectado;
hoy cualquier cuenta nueva se crea en `basic` pero puede usar todo sin restricción.

## Pendiente

- Control de acceso real por plan (bloquear funciones/límites según Basic, Gold o Premium).
- Cambiar de plan desde la app (hoy solo se puede editar `plan` directamente en la tabla).
- Recuperar contraseña / editar perfil desde la UI.
- Proyecto de Supabase dedicado para Realtia (ver nota arriba).
- Empaquetado como app de Android/iOS (esta base en Vite + React está lista para envolverse
  con Capacitor sin reescribir pantallas).

## Desarrollo

```bash
npm install
npm run dev       # servidor de desarrollo
npm run build     # build de producción (carpeta dist/)
npm run preview   # sirve el build de producción localmente
```

No se necesita configurar nada para conectar con Supabase: `src/config/supabase.js` ya trae
la URL y la clave pública (segura de exponer) del proyecto. Solo hace falta un `.env` (ver
`.env.example`) si se quiere apuntar a otro proyecto distinto.
