// Motor de "Realtia Coach": convierte la meta anual del agente y su embudo actual en
// números concretos — cuánto lleva, cuánto le falta y cuántos cierres necesita — usando
// únicamente datos que la app ya captura (nada de IA ni servicios externos).

// Qué tan avanzada está cada etapa hacia convertirse en un cierre. Son supuestos
// razonables, no una medición exacta — sirven para ponderar el pipeline, no para
// prometer un número preciso.
export const PESO_ETAPA = {
  nueva: 0.10,
  calificacion: 0.25,
  visitas: 0.45,
  negociacion: 0.65,
  cierre: 0.85,
};

export function metaConfigurada(agency) {
  return !!(agency.metaAnual > 0 && agency.comisionPromedioPct > 0 && agency.precioPromedioVenta > 0);
}

export function calcularNegocio(oportunidades, agency) {
  if (!metaConfigurada(agency)) return null;

  const comisionFraccion = agency.comisionPromedioPct / 100;
  const anioActual = new Date().getFullYear();

  const ganadas = oportunidades.filter((o) => o.estado === "ganada");
  const ganadasEsteAnio = ganadas.filter((o) => o.cerradaEn && new Date(o.cerradaEn).getFullYear() === anioActual);

  const cerradoEsteAnio = ganadasEsteAnio.reduce((suma, o) => suma + (o.valor || 0) * comisionFraccion, 0);

  const activas = oportunidades.filter((o) => o.estado === "activa");
  const pipelinePonderado = activas.reduce((suma, o) => suma + (o.valor || 0) * comisionFraccion * (PESO_ETAPA[o.etapa] ?? 0), 0);

  const proyeccion = cerradoEsteAnio + pipelinePonderado;
  const faltante = Math.max(0, agency.metaAnual - proyeccion);

  const comisionPorCierre = agency.precioPromedioVenta * comisionFraccion;
  const cierresNecesarios = comisionPorCierre > 0 ? Math.ceil(agency.metaAnual / comisionPorCierre) : null;
  const cierresLogrados = ganadasEsteAnio.length;
  const cierresFaltantes = cierresNecesarios != null ? Math.max(0, cierresNecesarios - cierresLogrados) : null;

  return {
    metaAnual: agency.metaAnual,
    cerradoEsteAnio,
    pipelinePonderado,
    proyeccion,
    faltante,
    cierresNecesarios,
    cierresLogrados,
    cierresFaltantes,
    progresoPct: agency.metaAnual > 0 ? Math.min(100, Math.round((proyeccion / agency.metaAnual) * 100)) : 0,
  };
}

// Prioriza lo que más le conviene atender al agente hoy, a partir de señales que ya
// existen en su cartera. No usa IA: son reglas simples y explicables.
export function generarAccionesCoach(oportunidades, contactoNombre) {
  const acciones = [];

  const sinProximaAccion = oportunidades.filter((o) => o.estado === "activa" && (!o.proximaAccion || !o.proximaFecha));
  for (const o of sinProximaAccion.slice(0, 5)) {
    acciones.push({
      id: `op-sin-accion-${o.id}`,
      icono: "🎯",
      titulo: `Definir próximo paso con ${contactoNombre(o.contactoId)}`,
      detalle: "Oportunidad activa sin próxima acción — puede estancarse sin que nadie lo note.",
    });
  }

  const nuevasUltimos30Dias = oportunidades.filter((o) => o.creadoEn && (Date.now() - new Date(o.creadoEn).getTime()) / 86400000 <= 30).length;
  if (nuevasUltimos30Dias < 3) {
    acciones.push({
      id: "ritmo-bajo",
      icono: "📣",
      titulo: "Pocas oportunidades nuevas este mes",
      detalle: `Solo ${nuevasUltimos30Dias} en los últimos 30 días. Vale la pena prospectar o pedir referidos esta semana.`,
    });
  }

  return acciones;
}
