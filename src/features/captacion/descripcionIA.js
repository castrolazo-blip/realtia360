import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL, UNIDAD_TERRENO_LABEL } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";
import { supabase } from "../../lib/supabaseClient.js";

// Arma un resumen en texto plano de la propiedad (a partir de los mismos datos que ya se
// capturaron en el wizard) para pasárselo a la IA — así la función de Supabase no necesita
// conocer las etiquetas ni la estructura de la app, solo recibe una ficha ya legible.
export function construirResumenPropiedad(c) {
  const lineas = [];
  lineas.push(`Tipo: ${TIPO_INMUEBLE_LABEL[c.tipoInmueble] || c.tipoInmueble} en ${OPERACION_INMUEBLE_LABEL[c.operacion] || c.operacion}`);
  if (c.zona || c.direccion) lineas.push(`Ubicación: ${c.zona || c.direccion}`);
  lineas.push(`Precio: ${formatMoney(c.precio)}`);
  if (c.areaTerreno) lineas.push(`Terreno: ${c.areaTerreno} ${UNIDAD_TERRENO_LABEL[c.unidadTerreno || "varas2"]}`);
  if (c.areaConstruccion) lineas.push(`Construcción: ${c.areaConstruccion} m²`);
  if (c.antiguedad != null) lineas.push(`Antigüedad: ${c.antiguedad} años`);
  if (c.remodelada) lineas.push("Remodelada");
  if (c.amueblada) lineas.push("Amueblada");

  (c.espacios || []).forEach((e) => {
    const detalles = [];
    if (e.cantidad != null) detalles.push(`cantidad: ${e.cantidad}`);
    const caracts = (e.caracteristicas || [])
      .filter((car) => car.valor === true || (typeof car.valor === "string" && car.valor.trim()))
      .map((car) => (car.tipo === "texto" ? `${car.nombre}: ${car.valor}` : car.nombre));
    if (caracts.length) detalles.push(caracts.join(", "));
    if (detalles.length) lineas.push(`${e.nombre} — ${detalles.join(" · ")}`);
  });

  if (c.notas) lineas.push(`Notas del asesor: ${c.notas}`);

  return lineas.join("\n");
}

export async function generarDescripcionIA(captacion, agency) {
  const resumen = construirResumenPropiedad(captacion);
  const asesor = { nombre: agency?.nombreAgente || "", telefono: agency?.telefono || "" };
  const { data, error } = await supabase.functions.invoke("generar-descripcion", { body: { resumen, asesor } });
  if (error) {
    // supabase-js no expone el mensaje de error personalizado directo en `error.message`
    // para respuestas no-2xx — hay que leerlo del cuerpo de la respuesta original.
    let mensaje = error.message;
    try {
      const cuerpo = await error.context?.json();
      if (cuerpo?.error) mensaje = cuerpo.error;
    } catch {
      // sin cuerpo JSON legible, nos quedamos con el mensaje genérico
    }
    throw new Error(mensaje);
  }
  if (data?.error) throw new Error(data.error);
  return data.descripcion;
}
