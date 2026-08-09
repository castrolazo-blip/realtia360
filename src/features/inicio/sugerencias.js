import { diasDesde, diasHastaProximoCumple } from "../../lib/dates.js";
import { CIRCULO_LABEL } from "../../constants/contactos.js";

// Motor de sugerencias del Círculo de Influencia: reglas simples sobre los datos reales
// (días desde el último contacto, cumpleaños próximos, clientes anteriores olvidados).
export function generarSugerencias(contactos) {
  const sugerencias = [];
  for (const c of contactos) {
    const dias = diasDesde(c.ultimoContacto);
    if (dias != null && dias >= 30 && c.circulo) {
      sugerencias.push({
        id: `contacto-${c.id}`, contacto: c, icono: "💬",
        texto: `Hace ${dias} días que no hablás con ${c.nombre.split(" ")[0]}, de tu círculo de ${CIRCULO_LABEL[c.circulo]}. Un saludo puede reabrir la relación.`,
      });
    }
    const diasCumple = diasHastaProximoCumple(c.cumpleanos);
    if (diasCumple != null && diasCumple <= 3) {
      sugerencias.push({
        id: `cumple-${c.id}`, contacto: c, icono: "🎂",
        texto: diasCumple === 0
          ? `${c.nombre.split(" ")[0]} cumple años hoy. Es buen momento para una felicitación personalizada.`
          : `${c.nombre.split(" ")[0]} cumple años en ${diasCumple} día(s). Prepará una felicitación personalizada.`,
      });
    }
  }
  const clientesOlvidados = contactos.filter((c) => c.circulo === "clientes_anteriores" && (diasDesde(c.ultimoContacto) || 0) > 90);
  if (clientesOlvidados.length > 0) {
    sugerencias.push({
      id: "clientes-olvidados", contacto: null, icono: "📊",
      texto: `Tenés ${clientesOlvidados.length} persona(s) en tu círculo de Clientes anteriores sin contacto en más de 90 días. Buen momento para compartir un informe de mercado.`,
    });
  }
  return sugerencias.sort((a, b) => (b.contacto ? diasDesde(b.contacto.ultimoContacto) || 0 : 0) - (a.contacto ? diasDesde(a.contacto.ultimoContacto) || 0 : 0));
}
