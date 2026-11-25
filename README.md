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
    kyc/                      cumplimiento — identificación, riesgo por reglas, listas OFAC
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

> **Actualizado (noviembre 2026):** el Broker ya no lee la cartera de sus asesores, solo
> números — ver "Privacidad del Broker: solo números" más abajo. Lo que sigue describe el
> diseño original.

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

- **Asesor**: Inicio (círculo virtuoso), Llamar, Contactos, Oportunidades, Captación,
  Propiedades, Requerimientos, Cumplimiento, Agenda — su cartera personal.
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

## Cumplimiento (KYC/AML)

Expediente de verificación de identidad y riesgo por contacto (`features/kyc`,
`realtia_kyc`), privado del agente que lo hace, con lectura para el Broker como el resto
de la cartera de oficina:

- **Formulario de identificación**: documento, ocupación, origen de fondos, forma de pago,
  monto de la transacción, y dos casillas de criterio (PEP, país de alto riesgo).
- **Motor de riesgo por reglas** (`features/kyc/riesgo.js`): sin IA ni caja negra — cada
  factor (efectivo, monto alto, PEP, país de riesgo, fondos no declarados, coincidencia en
  listas) suma puntos explícitos hacia un puntaje 0–100 y un nivel bajo/medio/alto. El
  mismo cálculo se usa al guardar y al mostrar el detalle, así que nunca se desincroniza.
- **Verificación en listas de sanciones** (`supabase/functions/verificar-listas`): compara
  el nombre contra la lista pública OFAC SDN (Departamento del Tesoro de EE. UU., gratuita,
  sin API key) por similitud de palabras — no es una fuente de pago tipo Refinitiv/LexisNexis,
  pero es un primer filtro real con datos reales. Ninguna coincidencia se autorrechaza: solo
  queda marcada para que una persona la revise. **No verificado desde este entorno** que la
  URL de descarga (`treasury.gov/ofac/downloads/sdn.csv`) siga vigente — la salida bloquea
  ese dominio acá; probá el botón "Verificar ahora" y avisame si da error para ajustar la URL.

**Pendiente, no incluido en este corte:** subir el informe de Equifax (u otro buró) y que la
IA lo analice — necesita primero un bucket de Supabase Storage para los archivos (no existe
todavía, ningún módulo sube archivos aún) y una función nueva similar a
`generar-descripcion` pero con lectura de PDF. Evaluación de riesgo por oficina completa
(hoy Office Pulse solo alerta cuántos expedientes de riesgo alto quedan pendientes, no hay
un dashboard de cumplimiento dedicado para el Broker).

## Plan de negocio anual: la puerta de entrada

Todo en Realtia parte del plan de negocio del asesor (`features/plan`), siguiendo el
cuaderno "Business Plan" de la oficina. **Es obligatorio:** un asesor sin su plan del año
firmado ve solo el asistente hasta completarlo (`App.jsx`); se guarda en cada paso y se
retoma donde quedó. El broker no tiene esta puerta.

Pasos del asistente (`PlanWizard.jsx`): portada ("un sueño escrito se convierte en
meta…"), compromiso firmado con un toque, Visión, Misión, Valores (botones), mi "¿Por
qué?", logros del año anterior y metas del año en 5 áreas (negocio, financiero, personal,
familia, espiritual), metas de negocio, **cómo le daré seguimiento** (revisión semanal: día y
hora; revisión mensual con el broker; indicadores a medir) y **así ordenaré mi agenda**.
Donde hay que escribir, se ofrecen frases para tocar y ajustar (o dictar con el teclado).
El plan es un objetivo anual: no pide nombres de clientes.

**Agenda en bloques** (`agenda.js`): con las metas del plan se arma una semana sugerida
—redes, prospección (dura lo que piden las llamadas diarias), llamadas de seguimiento,
citas de captación, recorridos con compradores, reunión de oficina, capacitación,
administrativo y la revisión del plan a la hora elegida, sin cruces—. Se ajusta con
toques (días de trabajo, hora de inicio, quitar y agregar bloques, incluidos personales
como almuerzo o familia). Los bloques aparecen en Inicio ("Ahora toca…", con un toque
lleva a Llamar, Agenda o Mi plan), en Agenda (pestaña "Mi semana" y en la vista de día) y
en Mi plan. El día de revisión, Inicio recuerda revisar el plan.

**Metas de negocio** (`calculos.js`): meta monetaria ÷ comisión promedio = transacciones; de
ahí el embudo hacia atrás con tasas por defecto (4 de 10 llamadas son contactos efectivos,
3 de 10 efectivos dan cita, 1 de 10 citas cierra) → citas, efectivos y llamadas por año,
mes, semana y día. Esas metas del día reemplazan las fijas de "Mi día" y de Llamar; la meta
monetaria pasa a ser la meta del Coach.

Después: **Mi plan** (`MiPlan.jsx`, en el menú y en la tarjeta superior de Inicio con el
"¿Por qué?" y el avance en transacciones) muestra el plan completo con **Mi seguimiento**
(lo real de la semana y del mes contra lo que pide el plan, en los indicadores elegidos) y
**Mi semana**; cada sección se edita con un toque y se puede imprimir. El año del plan es el siguiente a partir de octubre.

**Base de datos** (`supabase/migrations/20261117090000_plan_anual.sql`): tabla
`realtia_planes` (una por asesor y año, privada) y `realtia_metricas_oficina()` suma los
planes **solo en números** (si está firmado, meta y comisión promedio). Office Pulse muestra
cuántos asesores firmaron su plan, la suma de metas y una columna "Plan" por asesor.

**Pendiente:** "Plan de trabajo" y "Plan de marketing" del cuaderno (faltan esas páginas) y
que el broker pueda ajustar las tasas de conversión de su oficina.

## Productividad: círculo virtuoso y modo Llamar

Integración de la app "Productividad" (gestión diaria del asesor), adaptada a lo que Realtia
ya tenía. Principio de diseño: **todo con botones, digitar lo mínimo** — el asesor solo
escribe si quiere dejar un comentario (y puede dictarlo con el micrófono del teclado).

- **Inicio del asesor = círculo virtuoso** (`components/shared/CirculoVirtuoso.jsx`): las 4
  etapas de cada negocio en un anillo — 1. Búsqueda, 2. Captación formal, 3. Negociación,
  4. Cierre — bajo el lema *"lo que está vacío, no produce"*. Se calcula con lo que ya existe
  (`features/llamar/gestion.js → calcularCirculo`), sin tablas nuevas: Búsqueda = contactos
  que quieren vender/dar en alquiler o comprar/alquilar + requerimientos activos +
  oportunidades recién abiertas; Captación = captaciones en proceso o publicadas y
  disponibles; Negociación = oportunidades en visitas o negociación; Cierre = oportunidades
  en cierre. Cada etapa lleva a su módulo; si está vacía, lleva a la acción que la llena.
  Arriba: "Iniciar prospección" (con el tamaño de la cola) e indicadores del día (intentos,
  contactos efectivos y citas contra su meta diaria).
- **Llamar** (`features/llamar/Llamar.jsx`): cola automática — llamadas vencidas, las de hoy
  y contactos sin gestión (los más antiguos primero). Por cada contacto: botón de llamada o
  WhatsApp, cómo salió (6 botones), próxima fecha (mañana / 3 / 7 / 30 días / elegir),
  "Agendé una cita" con hora, qué quiere hacer el contacto y su estado. "Guardar y siguiente"
  registra la llamada, da por hechas las llamadas pendientes de ese contacto y agenda la
  próxima en la Agenda (llamada o cita) sin escribir nada.
- **Contactos**: nuevo modo de filtro "📞 Gestión" (Búsqueda, prospectos, compradores, sin
  gestión, en seguimiento, con próxima acción, futuro, no interesados, no contactar),
  búsqueda por teléfono, y en la ficha: botón "Llamar y registrar resultado", estado de
  gestión y objetivos con un toque, y las últimas llamadas.
- **Importar contactos** (`features/contactos/ImportarContactosModal.jsx`): Excel, CSV o .vcf
  del teléfono. Normaliza teléfonos a +503, omite repetidos por teléfono y no guarda nada
  hasta confirmar. Los importados entran como "Sin gestión" a la cola de Llamar. El lector
  de Excel se descarga de cdnjs solo la primera vez que alguien importa un .xlsx.
- **Barra móvil del asesor**: Inicio · Llamar · Contactos · Oportunidades · Agenda.
  Captación se abre desde la etapa 2 del círculo o desde los accesos rápidos.

**Base de datos** (`supabase/migrations/20261116090000_gestion_llamadas.sql`): columnas
`estado_gestion`, `objetivos`, `origen`, `numero_incorrecto` y `ultima_gestion` en
`realtia_contactos` (el estado de gestión es distinto de la `clasificacion`, que describe la
relación), y tabla nueva `realtia_interacciones` (una fila por llamada o WhatsApp, privada
del agente).

**Privacidad del Broker: solo números.** La misma migración elimina las políticas que le
dejaban leer la cartera de sus asesores (contactos, oportunidades, captaciones no
publicadas, actividades, requerimientos y KYC). En su lugar, `realtia_metricas_oficina()`
devuelve únicamente estados, montos y fechas — nunca nombres, teléfonos, notas ni títulos de
actividades — y solo si quien la llama es Broker de esa oficina. Office Pulse suma la
gestión de llamadas de la semana por asesor; el detalle de cada asesor muestra conteos por
tipo de actividad en vez de la lista de citas.

**Pendiente de esta integración (fases siguientes):** bloques fijos de agenda con agenda
sugerida, metas semanales/mensuales con proyección y cuello de botella, comisión cobrada al
cerrar, ranking de asesores y conversiones en Office Pulse, y el Coach con IA (plan de 7
días, depende de `ANTHROPIC_API_KEY`).

## Diseño de Propiedades y fotos

Propiedades y su ficha siguen el estilo de una app de propiedades: fondo blanco, tarjetas
redondeadas con foto grande, categorías por tipo de inmueble en íconos circulares, filtros
en un botón oscuro, "Recién publicadas" en carrusel y el inventario completo debajo
(`features/propiedades/Propiedades.jsx`, piezas en `ui.jsx`). La ficha
(`PropiedadDetalleModal.jsx`) es de pantalla completa: foto principal con galería de
miniaturas, precio, características (habitaciones, baños, área), descripción con "Leer
más", amenidades, asesor responsable con WhatsApp y llamada, y "Agendar visita" (día y
hora con botones, cliente opcional; queda como actividad de tipo visita en la Agenda).
Favoritas: corazón por propiedad, guardado solo en ese dispositivo.

**Fotos** (`supabase/migrations/20261116100000_fotos_propiedad.sql`): columna `fotos` en
`realtia_captaciones` (lista ordenada, la primera es la portada) y bucket público de lectura
`realtia-fotos`; cada agente solo escribe en su carpeta `<agente_id>/…`. Las fotos se reducen
en el navegador a 1600 px en JPEG antes de subir (`lib/fotos.js`). Se administran
(agregar desde galería o cámara, elegir portada, quitar) con `GestorFotos` en el detalle de
la captación y en la ficha de la propiedad cuando es propia. El directorio de la oficina
ahora incluye el teléfono del asesor para los botones de contacto de la ficha.

**Estilo general:** títulos con la misma letra sin serifa en negrita, fondo blanco, botones
principales oscuros (`ink-950`) y selección en oscuro; el verde de marca queda como acento.

## Comercialización por planes

`src/config/plans.js` define Basic / Gold / Premium (con límites de referencia) y
`<PlanBadge />` los muestra en el sidebar, tomando el plan real del perfil del agente. El
control de acceso — bloquear funciones o límites según el plan — todavía no está conectado;
hoy cualquier cuenta nueva se crea en `basic` pero puede usar todo sin restricción.

## Pendiente

- **Certificaciones por asesor** (pedido del dueño, a definir): registrar las certificaciones
  que tiene o va cursando cada agente. El detalle de qué certificaciones son lo va a enviar
  el dueño; falta decidir dónde se muestran (perfil del asesor, Agentes del Broker) y si
  llevan vencimiento o constancia adjunta.
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
