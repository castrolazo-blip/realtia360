// Catálogo de espacios y características de la propiedad (matriz de captación).
// tipo de cada característica: 'toggle' (sí/no), 'contador' (cantidad numérica), 'texto' (dato libre corto).
// "contadores": conteos principales del espacio, mostrados como steppers grandes arriba del detalle.
export const ESPACIOS_CATALOGO = [
  {
    id: "sala", nombre: "Sala", icono: "🛋️", contadores: [], caracteristicas: [
      { id: "dimensiones", nombre: "Dimensiones", tipo: "texto" },
      { id: "iluminacion", nombre: "Iluminación natural", tipo: "toggle" },
      { id: "vista", nombre: "Vista exterior", tipo: "toggle" },
      { id: "aire", nombre: "Aire acondicionado", tipo: "toggle" },
      { id: "ventilador", nombre: "Ventilador", tipo: "toggle" },
      { id: "piso", nombre: "Piso", tipo: "texto" },
      { id: "chimenea", nombre: "Chimenea", tipo: "toggle" },
      { id: "amueblada", nombre: "Amueblada", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "comedor", nombre: "Comedor", icono: "🍽️", contadores: [], caracteristicas: [
      { id: "dimensiones", nombre: "Dimensiones", tipo: "texto" },
      { id: "iluminacion", nombre: "Iluminación natural", tipo: "toggle" },
      { id: "vista", nombre: "Vista exterior", tipo: "toggle" },
      { id: "conexion_cocina", nombre: "Conexión a cocina", tipo: "toggle" },
      { id: "piso", nombre: "Piso", tipo: "texto" },
      { id: "amueblada", nombre: "Amueblada", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "cocina", nombre: "Cocina", icono: "🍳", contadores: [], caracteristicas: [
      { id: "tipo_cocina", nombre: "Tipo de cocina", tipo: "texto" },
      { id: "desayunador", nombre: "Con desayunador", tipo: "toggle" },
      { id: "alacena", nombre: "Alacena", tipo: "toggle" },
      { id: "muebles", nombre: "Muebles de cocina", tipo: "toggle" },
      { id: "cubierta", nombre: "Cubierta (material)", tipo: "texto" },
      { id: "estufa", nombre: "Estufa", tipo: "toggle" },
      { id: "horno", nombre: "Horno", tipo: "toggle" },
      { id: "lavavajillas", nombre: "Lavavajillas", tipo: "toggle" },
      { id: "extractor", nombre: "Extractor", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "habitaciones", nombre: "Habitaciones", icono: "🛏️", caracteristicasPorUnidad: true, contadores: [
      { id: "senior", nombre: "Habitación senior" },
      { id: "junior", nombre: "Habitación junior" },
      { id: "estudio", nombre: "Estudio" },
    ], caracteristicas: [
      { id: "con_bano", nombre: "Con baño", tipo: "toggle" },
      { id: "walk_in_closet", nombre: "Walk-in closet", tipo: "toggle" },
      { id: "closet", nombre: "Closet", tipo: "toggle" },
      { id: "balcon", nombre: "Balcón", tipo: "toggle" },
      { id: "aire", nombre: "Aire acondicionado", tipo: "toggle" },
      { id: "ventilador", nombre: "Ventilador", tipo: "toggle" },
      { id: "iluminacion", nombre: "Iluminación natural", tipo: "toggle" },
      { id: "vista", nombre: "Vista exterior", tipo: "toggle" },
      { id: "piso", nombre: "Piso", tipo: "texto" },
      { id: "amueblada", nombre: "Amueblada", tipo: "toggle" },
      { id: "dimensiones", nombre: "Dimensiones", tipo: "texto" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "banos", nombre: "Baños", icono: "🚿", caracteristicasPorUnidad: true, contadores: [
      { id: "completos", nombre: "Baño completo" },
      { id: "medios", nombre: "Medio baño" },
    ], caracteristicas: [
      { id: "tina", nombre: "Tina", tipo: "toggle" },
      { id: "ducha", nombre: "Ducha", tipo: "toggle" },
      { id: "cancel", nombre: "Cancel de vidrio", tipo: "toggle" },
      { id: "lavabos", nombre: "Lavabos (cantidad)", tipo: "contador" },
      { id: "mueble_bano", nombre: "Mueble de baño", tipo: "toggle" },
      { id: "ventilacion", nombre: "Ventilación natural", tipo: "toggle" },
      { id: "extractor", nombre: "Extractor", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "estudio_oficina", nombre: "Estudio/Oficina", icono: "💻", contadores: [], caracteristicas: [
      { id: "dimensiones", nombre: "Dimensiones", tipo: "texto" },
      { id: "iluminacion", nombre: "Iluminación natural", tipo: "toggle" },
      { id: "aire", nombre: "Aire acondicionado", tipo: "toggle" },
      { id: "libreros", nombre: "Closet o libreros", tipo: "toggle" },
      { id: "piso", nombre: "Piso", tipo: "texto" },
      { id: "amueblada", nombre: "Amueblada", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "family_room", nombre: "Family Room", icono: "📺", contadores: [], caracteristicas: [
      { id: "dimensiones", nombre: "Dimensiones", tipo: "texto" },
      { id: "iluminacion", nombre: "Iluminación natural", tipo: "toggle" },
      { id: "aire", nombre: "Aire acondicionado", tipo: "toggle" },
      { id: "ventilador", nombre: "Ventilador", tipo: "toggle" },
      { id: "piso", nombre: "Piso", tipo: "texto" },
      { id: "amueblada", nombre: "Amueblada", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "terraza_balcon", nombre: "Terraza/Balcón", icono: "🌇", contadores: [{ id: "cantidad", nombre: "Cantidad" }], caracteristicas: [
      { id: "dimensiones", nombre: "Dimensiones", tipo: "texto" },
      { id: "techada", nombre: "Techada", tipo: "toggle" },
      { id: "vista", nombre: "Vista", tipo: "texto" },
      { id: "barandal", nombre: "Barandal", tipo: "toggle" },
      { id: "piso", nombre: "Piso", tipo: "texto" },
      { id: "conexion_social", nombre: "Conexión a área social", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "cuarto_servicio", nombre: "Cuarto de Servicio", icono: "🧺", contadores: [], caracteristicas: [
      { id: "con_bano", nombre: "Con baño", tipo: "toggle" },
      { id: "closet", nombre: "Closet", tipo: "toggle" },
      { id: "ventilacion", nombre: "Ventilación natural", tipo: "toggle" },
      { id: "piso", nombre: "Piso", tipo: "texto" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "patio_jardin", nombre: "Patio/Jardín", icono: "🌳", contadores: [], caracteristicas: [
      { id: "dimensiones", nombre: "Dimensiones", tipo: "texto" },
      { id: "area_verde", nombre: "Área verde", tipo: "toggle" },
      { id: "piso", nombre: "Piso/terraza", tipo: "texto" },
      { id: "iluminacion", nombre: "Iluminación", tipo: "toggle" },
      { id: "bbq", nombre: "Área de BBQ", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "area_lavado", nombre: "Área de Lavado", icono: "🧼", contadores: [], caracteristicas: [
      { id: "techada", nombre: "Techada", tipo: "toggle" },
      { id: "conexion_lavadora", nombre: "Conexión para lavadora", tipo: "toggle" },
      { id: "conexion_secadora", nombre: "Conexión para secadora", tipo: "toggle" },
      { id: "lavadero", nombre: "Lavadero", tipo: "toggle" },
      { id: "boiler", nombre: "Boiler", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "estacionamiento", nombre: "Estacionamiento", icono: "🚗", contadores: [{ id: "cantidad", nombre: "Cantidad de cajones" }], caracteristicas: [
      { id: "techado", nombre: "Techado", tipo: "toggle" },
      { id: "porton_electrico", nombre: "Portón eléctrico", tipo: "toggle" },
      { id: "bodega", nombre: "Bodega", tipo: "toggle" },
      { id: "visitas", nombre: "Estacionamiento para visitas", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "amenidades", nombre: "Amenidades", icono: "🏊", contadores: [], caracteristicas: [
      { id: "piscina", nombre: "Piscina", tipo: "toggle" },
      { id: "jardin", nombre: "Jardín", tipo: "toggle" },
      { id: "terraza", nombre: "Terraza", tipo: "toggle" },
      { id: "balcon", nombre: "Balcón", tipo: "toggle" },
      { id: "casa_club", nombre: "Casa Club", tipo: "toggle" },
      { id: "gimnasio", nombre: "Gimnasio", tipo: "toggle" },
      { id: "area_infantil", nombre: "Área Infantil", tipo: "toggle" },
      { id: "cancha", nombre: "Cancha", tipo: "toggle" },
      { id: "seguridad", nombre: "Seguridad 24/7", tipo: "toggle" },
      { id: "parqueo_visitas", nombre: "Parqueo para Visitas", tipo: "toggle" },
      { id: "ascensor", nombre: "Ascensor", tipo: "toggle" },
      { id: "lobby", nombre: "Lobby", tipo: "toggle" },
      { id: "cisterna", nombre: "Cisterna", tipo: "toggle" },
      { id: "planta_electrica", nombre: "Planta Eléctrica", tipo: "toggle" },
      { id: "pet_friendly", nombre: "Pet Friendly", tipo: "toggle" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
  {
    id: "otros_espacios", nombre: "Otros Espacios", icono: "➕", contadores: [], caracteristicas: [
      { id: "descripcion", nombre: "Descripción", tipo: "texto" },
      { id: "otros", nombre: "Otros detalles", tipo: "texto" },
    ],
  },
];
