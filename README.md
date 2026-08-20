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
    inicio/                 pantalla de inicio del asesor (feed en móvil, dashboard en escritorio)
    oficina/                Office Pulse — pantalla de inicio del broker (equipo de la oficina)
    agentes/                roster de la oficina + dashboard individual por asesor
    produccion/              cierres del mes y de los últimos 6 meses de la oficina
    proyecciones/            proyección de la oficina (Realtia Coach a nivel oficina)
    administracion/          perfil de la oficina + listado de agentes
    contactos/               CRM + Círculo de Influencia
    oportunidades/           embudo de ventas
    captacion/                captación guiada (Método DEC), ACM, ficha imprimible, kanban
    propiedades/             inventario publicado de toda la oficina (solo lectura)
    requerimientos/           lo que busca un comprador + matching contra el inventario
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

**Tablas** (proyecto Supabase propio de Realtia — ver nota abajo, prefijo `realtia_` por
historia, no por necesidad de aislarse de otro sistema): `realtia_perfiles`,
`realtia_contactos`, `realtia_oportunidades`, `realtia_actividades`, `realtia_captaciones`,
`realtia_oficinas`. El perfil de plan (`basic` / `gold` / `premium`) vive en
`realtia_perfiles.plan`; la oficina y el rol (`asesor` / `broker`) del agente viven en
`realtia_perfiles.oficina_id` y `realtia_perfiles.rol` (ver sección "Oficina: rol de Broker
y Office Pulse" más abajo).

**Nota sobre el proyecto de Supabase:** Realtia tiene su propio proyecto de Supabase
(`realtia`, ref `jnkrrbbzghtdzylpjsgc`, plan free, $0/mes), separado del proyecto
`sport-car-system` (otro sistema de negocio del propietario) donde vivió temporalmente al
principio por un límite de proyectos gratuitos en la cuenta. El esquema completo —tablas,
RLS, funciones y trigger de alta— está en
`supabase/migrations/20260819180000_realtia_schema.sql`, pensado como línea base
reproducible de este proyecto. Los 3 perfiles de prueba que existían en el proyecto
compartido (datos de prueba, no de producción) no se migraron a propósito; el proyecto
nuevo arrancó limpio.

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
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref jnkrrbbzghtdzylpjsgc
```

o desde el dashboard: **Project Settings → Edge Functions → Manage secrets**. Mientras no esté
configurada, el botón "Generar con IA" muestra un mensaje de error indicándolo, sin romper el
resto de la app.

## Oficina: rol de Broker y Office Pulse

Cada perfil tiene ahora un `rol` (`asesor` o `broker`) y pertenece a una `realtia_oficinas`.
Cuando alguien se registra, el trigger de Postgres (`realtia_handle_new_user`) lo une a la
oficina existente cuyo nombre coincida (sin distinguir mayúsculas) con el que escribió, o
crea una oficina nueva si es la primera vez que se usa ese nombre — quien la crea queda
como su broker; quien se suma después, como asesor. Es una heurística simple por nombre de
oficina, sin flujo de invitación todavía; suficiente para esta fase de pruebas.

Un Broker ve, **solo en modo lectura**, la cartera de todos los agentes de su oficina —
nunca puede editarla ni borrarla, y jamás ve la de una oficina distinta a la suya. Esto lo
resuelve el RLS de Postgres, no el frontend: hay una política adicional de `SELECT` por
tabla (`realtia_contactos`, `realtia_oportunidades`, `realtia_captaciones`,
`realtia_actividades`, `realtia_perfiles`) que solo deja pasar filas de agentes de la misma
oficina cuando quien consulta tiene `rol = 'broker'`, apoyada en dos funciones
`security definer` (`realtia_mi_oficina_id()`, `realtia_soy_broker()`) que evitan que la
política se consulte a sí misma de forma recursiva. Ver
`supabase/migrations/20260819180000_realtia_schema.sql`.

En el frontend, `AppDataContext` carga esa cartera de oficina (`equipo`,
`oficinaCartera`) únicamente cuando el perfil es de un broker.

### Navegación distinta por rol

Un Broker no ve el menú de un asesor — vería su propia cartera personal, no cómo está la
oficina. `config/nav.js` define dos navegaciones separadas (`NAV_ASESOR` / `NAV_BROKER`),
y `DesktopShell`/`MobileShell` eligen una u otra según `agency.rol`:

- **Asesor**: Inicio, Contactos, Oportunidades, Captación, Propiedades, Requerimientos,
  Agenda — su cartera personal.
- **Broker**: Inicio (Office Pulse), Agentes, Producción, Proyecciones, Propiedades,
  Administración — la oficina completa. Ninguno de estos módulos deja escribir en la
  cartera de un agente, solo leerla (el mismo RLS de arriba).

Los cuatro módulos del Broker se alimentan de los mismos datos que ya cargan los asesores
(`oficinaCartera`, agregada en `features/agentes/resumenOficina.js` para no repetir la
cuenta en cada pantalla):

- **`features/oficina/OfficePulse.jsx`** — inicio del Broker: indicadores de oficina
  (contactos, oportunidades activas, captaciones publicadas, cierres, producción) y una
  tabla resumen por asesor.
- **`features/agentes/Agentes.jsx`** — roster de la oficina; cada tarjeta abre
  `AgenteDetalleModal.jsx`, el "dashboard individual del asesor" del plano original:
  pipeline por etapa, captaciones por estado y próximas actividades de esa persona,
  reconstruido a partir de `oficinaCartera` filtrada a su `agente_id`.
- **`features/produccion/Produccion.jsx`** — cierres del mes y de los últimos 6 meses de
  toda la oficina (oportunidades en estado `ganada`).
- **`features/proyecciones/Proyecciones.jsx`** — reutiliza el motor de "Realtia Coach"
  (`features/inicio/negocio.js`) pero corrido sobre el embudo de **toda la oficina**; la
  meta base es la que el Broker configura en su propio perfil (pensada acá como meta de
  oficina, no personal).
- **`features/administracion/Administracion.jsx`** — nombre/ubicación de la oficina y el
  listado de quién pertenece a ella.

**Pendiente de esta capa:** un flujo real de invitación a la oficina (hoy depende de que el
asesor escriba el mismo nombre exacto al registrarse — `Administracion.jsx` ya lo señala
como pendiente en su propia pantalla).

## Propiedades y Requerimientos

Dos módulos nuevos que conectan la captación (privada, del agente que la trabaja) con el
resto de la oficina:

- **Propiedades** (`features/propiedades`): cuando una captación llega a `estado =
  'publicada'`, deja de ser solo del agente que la trabajó y pasa a ser inventario visible
  para **toda la oficina** — cualquier agente puede verla (no solo el Broker), porque
  necesita poder ofrecerla a sus propios compradores. Es de solo lectura: nadie puede
  editar ni cambiar el estado de una propiedad que no es suya, ni ve datos del propietario
  (eso sigue siendo privado del agente que la captó). Antes de `publicada`, la captación
  sigue siendo privada, igual que siempre.
- **Requerimientos** (`features/requerimientos`): lo que busca un comprador (tipo de
  inmueble, operación, zona, rango de precio), siempre privado del agente que lo registró.
  Cada requerimiento se compara contra el inventario de Propiedades con un matching simple
  por reglas (`matching.js`) — tipo, operación, precio y zona, con crédito parcial cuando el
  precio se pasa poco del rango. No usa IA ni pondera "Buyer DNA" (necesario / muy
  importante / deseable) todavía, eso queda para una fase posterior.

Esto lo permiten dos piezas nuevas en la base de datos (ver
`supabase/migrations/20260819190000_propiedades_requerimientos.sql`): una política de RLS
que abre `realtia_captaciones` publicadas a toda la oficina (antes solo el broker podía ver
más allá de lo propio), y una función `realtia_directorio_oficina()` que expone únicamente
`id`/`nombre_agente`/`rol` de los compañeros —nunca teléfono, meta anual ni comisión— para
poder mostrar "Asesor: fulano" en una propiedad ajena sin exponer el resto de su perfil.

En móvil, estos dos módulos no están en la barra inferior (`NAV_MOVIL` en `config/nav.js`
los excluye a propósito, siguiendo el principio de no saturar la navegación táctil) — se
llega a ellos desde los accesos rápidos de Inicio ("Ver propiedades" / "Nuevo
requerimiento").

### Disponibilidad y carga rápida

Cada propiedad publicada tiene una **disponibilidad** (`disponible` / `reservada` /
`cerrada` / `no_disponible`), independiente del pipeline de captación — espeja la
estructura real que ya usa la oficina en Google Drive (una carpeta por asesor, y dentro de
cada una: Venta, Alquiler, Propiedades Reservadas, Propiedades Cerradas, Propiedades No
Disponibles, Requerimientos). Una propiedad "cerrada" o "no disponible" sigue en el
inventario como registro histórico, no desaparece.

Para las propiedades que ya existen de verdad (documentadas fuera de Realtia, en esas
carpetas de Drive), **Captación → "Cargar existente"** (`CargaRapidaModal.jsx`) las registra
directo como publicadas, con el checklist ya marcado completo, sin pasar por el wizard
guiado (Método DEC, espacios, ACM). Cada asesor carga las suyas — no hay una vía para que
el Broker cargue a nombre de otro agente todavía (el RLS solo permite `agente_id =
auth.uid()` al insertar).

**Pendiente, no incluido en este corte:** la sincronización real con Google Drive (subir/ver
archivos desde Realtia en vez de solo replicar la categoría) — hoy solo se adoptó la misma
taxonomía como dato en la base, no hay integración con la API de Drive todavía.

## Comercialización por planes

`src/config/plans.js` define Basic / Gold / Premium (con límites de referencia) y
`<PlanBadge />` los muestra en el sidebar, tomando el plan real del perfil del agente. El
control de acceso — bloquear funciones o límites según el plan — todavía no está conectado;
hoy cualquier cuenta nueva se crea en `basic` pero puede usar todo sin restricción.

## Pendiente

- Control de acceso real por plan (bloquear funciones/límites según Basic, Gold o Premium).
- Cambiar de plan desde la app (hoy solo se puede editar `plan` directamente en la tabla).
- Recuperar contraseña / editar perfil desde la UI.
- Cargar `ANTHROPIC_API_KEY` como secreto del proyecto de Supabase (ver sección de arriba).
- Matching de Requerimientos con ponderación tipo "Buyer DNA" (necesario / muy importante /
  deseable) en vez de reglas fijas; y expedientes/documentos de la propiedad en Google
  Drive (hoy las captaciones no tienen fotos, solo datos estructurados).
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
