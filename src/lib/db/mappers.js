// Traduce entre las filas de Supabase (snake_case) y los objetos que usa la UI
// (camelCase, igual que en la Fase 1). Mantener esta traducción en un solo lugar
// permite que ningún componente de features/ necesite saber cómo se llaman las
// columnas en la base de datos.

export function contactoFromRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    empresa: row.empresa,
    ciudad: row.ciudad,
    clasificacion: row.clasificacion,
    telefono: row.telefono,
    correo: row.correo,
    circulo: row.circulo,
    cercania: row.cercania,
    profesion: row.profesion,
    cumpleanos: row.cumpleanos,
    ultimoContacto: row.ultimo_contacto,
    potencialReferidos: row.potencial_referidos,
    valorEstrategico: row.valor_estrategico,
    intereses: row.intereses,
    notas: row.notas || [],
  };
}
export function contactoToRow(c) {
  return {
    nombre: c.nombre,
    empresa: c.empresa ?? null,
    ciudad: c.ciudad ?? null,
    clasificacion: c.clasificacion,
    telefono: c.telefono ?? null,
    correo: c.correo ?? null,
    circulo: c.circulo ?? null,
    cercania: c.cercania ?? null,
    profesion: c.profesion ?? null,
    cumpleanos: c.cumpleanos ?? null,
    ultimo_contacto: c.ultimoContacto ?? null,
    potencial_referidos: c.potencialReferidos ?? null,
    valor_estrategico: c.valorEstrategico ?? "estandar",
    intereses: c.intereses ?? null,
    notas: c.notas ?? [],
  };
}

export function oportunidadFromRow(row) {
  return {
    id: row.id,
    contactoId: row.contacto_id,
    tipo: row.tipo,
    etapa: row.etapa,
    estado: row.estado,
    valor: row.valor,
    zona: row.zona,
    proximaAccion: row.proxima_accion,
    proximaFecha: row.proxima_fecha,
    motivoCierre: row.motivo_cierre,
    creadoEn: row.created_at,
    cerradaEn: row.cerrada_en,
  };
}
export function oportunidadToRow(o) {
  return {
    contacto_id: o.contactoId ?? null,
    tipo: o.tipo,
    etapa: o.etapa ?? "nueva",
    estado: o.estado ?? "activa",
    valor: o.valor ?? null,
    zona: o.zona ?? null,
    proxima_accion: o.proximaAccion ?? null,
    proxima_fecha: o.proximaFecha ?? null,
    motivo_cierre: o.motivoCierre ?? null,
    cerrada_en: o.cerradaEn ?? null,
  };
}

export function actividadFromRow(row) {
  return {
    id: row.id,
    contactoId: row.contacto_id,
    oportunidadId: row.oportunidad_id,
    tipo: row.tipo,
    titulo: row.titulo,
    fechaHora: row.fecha_hora,
    estado: row.estado,
    duracion: row.duracion,
    resultado: row.resultado,
  };
}
export function actividadToRow(a) {
  return {
    contacto_id: a.contactoId ?? null,
    oportunidad_id: a.oportunidadId ?? null,
    tipo: a.tipo,
    titulo: a.titulo,
    fecha_hora: a.fechaHora,
    estado: a.estado ?? "pendiente",
    duracion: a.duracion ?? null,
    resultado: a.resultado ?? null,
  };
}

export function captacionFromRow(row) {
  return {
    id: row.id,
    agenteId: row.agente_id,
    contactoId: row.contacto_id,
    tipoInmueble: row.tipo_inmueble,
    operacion: row.operacion,
    direccion: row.direccion,
    zona: row.zona,
    precio: row.precio,
    comisionPct: row.comision_pct,
    estado: row.estado,
    notas: row.notas,
    creadoEn: row.created_at,
    areaTerreno: row.area_terreno,
    unidadTerreno: row.unidad_terreno,
    areaConstruccion: row.area_construccion,
    antiguedad: row.antiguedad,
    remodelada: row.remodelada,
    amueblada: row.amueblada,
    checklist: row.checklist || [],
    diagnostico: row.diagnostico || [],
    espacios: row.espacios || [],
    acm: row.acm || null,
    descripcionIA: row.descripcion_ia || "",
  };
}
export function captacionToRow(c) {
  return {
    contacto_id: c.contactoId ?? null,
    tipo_inmueble: c.tipoInmueble,
    operacion: c.operacion ?? "venta",
    direccion: c.direccion ?? null,
    zona: c.zona ?? null,
    precio: c.precio ?? null,
    comision_pct: c.comisionPct ?? null,
    estado: c.estado ?? "borrador",
    notas: c.notas ?? null,
    area_terreno: c.areaTerreno ?? null,
    unidad_terreno: c.unidadTerreno ?? "varas2",
    area_construccion: c.areaConstruccion ?? null,
    antiguedad: c.antiguedad ?? null,
    remodelada: !!c.remodelada,
    amueblada: !!c.amueblada,
    checklist: c.checklist ?? [],
    diagnostico: c.diagnostico ?? [],
    espacios: c.espacios ?? [],
    acm: c.acm ?? null,
  };
}

export function requerimientoFromRow(row) {
  return {
    id: row.id,
    contactoId: row.contacto_id,
    tipoInmueble: row.tipo_inmueble,
    operacion: row.operacion,
    zona: row.zona,
    precioMin: row.precio_min,
    precioMax: row.precio_max,
    notas: row.notas,
    estado: row.estado,
    creadoEn: row.created_at,
  };
}
export function requerimientoToRow(r) {
  return {
    contacto_id: r.contactoId ?? null,
    tipo_inmueble: r.tipoInmueble ?? null,
    operacion: r.operacion ?? "venta",
    zona: r.zona ?? null,
    precio_min: r.precioMin ?? null,
    precio_max: r.precioMax ?? null,
    notas: r.notas ?? null,
    estado: r.estado ?? "activo",
  };
}

export function perfilFromRow(row) {
  return {
    id: row.id,
    nombreAgente: row.nombre_agente,
    nombreOficina: row.nombre_oficina,
    ubicacion: row.ubicacion,
    plan: row.plan,
    telefono: row.telefono || "",
    metaAnual: row.meta_anual,
    comisionPromedioPct: row.comision_promedio_pct,
    precioPromedioVenta: row.precio_promedio_venta,
    oficinaId: row.oficina_id ?? null,
    rol: row.rol || "asesor",
  };
}
