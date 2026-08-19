// Compara un requerimiento (lo que busca un comprador) contra una propiedad publicada del
// inventario de oficina. Reglas simples por diseño — sin IA ni ponderación de "Buyer DNA"
// todavía —, cada criterio pesa lo mismo que su relevancia real en una búsqueda inmobiliaria:
// tipo de inmueble y operación son filtros duros (30/20), precio y zona son más flexibles
// (30/20, con crédito parcial cuando el precio se pasa poco del rango).
const PESO_TIPO = 30;
const PESO_OPERACION = 20;
const PESO_PRECIO = 30;
const PESO_ZONA = 20;

function coincideTexto(a, b) {
  if (!a || !b) return false;
  const na = a.trim().toLowerCase();
  const nb = b.trim().toLowerCase();
  return na.includes(nb) || nb.includes(na);
}

export function calcularMatch(requerimiento, propiedad) {
  const detalle = [];
  let puntos = 0;

  if (!requerimiento.tipoInmueble) {
    puntos += PESO_TIPO;
  } else {
    const cumple = requerimiento.tipoInmueble === propiedad.tipoInmueble;
    if (cumple) puntos += PESO_TIPO;
    detalle.push({ criterio: "Tipo de inmueble", cumple });
  }

  const operacionCumple = requerimiento.operacion === propiedad.operacion;
  if (operacionCumple) puntos += PESO_OPERACION;
  detalle.push({ criterio: "Operación", cumple: operacionCumple });

  if (requerimiento.precioMin == null && requerimiento.precioMax == null) {
    puntos += PESO_PRECIO;
  } else if (propiedad.precio == null) {
    detalle.push({ criterio: "Precio", cumple: false });
  } else {
    const min = requerimiento.precioMin ?? 0;
    const max = requerimiento.precioMax ?? Infinity;
    if (propiedad.precio >= min && propiedad.precio <= max) {
      puntos += PESO_PRECIO;
      detalle.push({ criterio: "Precio", cumple: true });
    } else {
      const limite = propiedad.precio < min ? min : max;
      const desvioPct = Math.abs(propiedad.precio - limite) / limite;
      const parcial = desvioPct <= 0.15; // hasta 15% fuera de rango cuenta como acercamiento
      if (parcial) puntos += PESO_PRECIO / 2;
      detalle.push({ criterio: "Precio", cumple: false, cerca: parcial });
    }
  }

  if (!requerimiento.zona) {
    puntos += PESO_ZONA;
  } else {
    const cumple = coincideTexto(requerimiento.zona, propiedad.zona) || coincideTexto(requerimiento.zona, propiedad.direccion);
    if (cumple) puntos += PESO_ZONA;
    detalle.push({ criterio: "Zona", cumple });
  }

  return { porcentaje: Math.round(puntos), detalle };
}

// Devuelve las propiedades del inventario de oficina ordenadas de mejor a peor match,
// cada una con su porcentaje y detalle ya calculados.
export function matchesParaRequerimiento(requerimiento, propiedadesOficina) {
  return propiedadesOficina
    .map((p) => ({ propiedad: p, ...calcularMatch(requerimiento, p) }))
    .sort((a, b) => b.porcentaje - a.porcentaje);
}
