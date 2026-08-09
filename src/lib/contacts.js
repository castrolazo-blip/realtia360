import { CIRCULO_LABEL } from "../constants/contactos.js";

export const soloDigitos = (tel) => (tel || "").replace(/[^\d]/g, "");
export const telHref = (tel) => `tel:${(tel || "").replace(/[\s-]/g, "")}`;
export const waHref = (tel, texto) => `https://wa.me/${soloDigitos(tel)}${texto ? `?text=${encodeURIComponent(texto)}` : ""}`;
export const mailHref = (correo, asunto) => `mailto:${correo || ""}${asunto ? `?subject=${encodeURIComponent(asunto)}` : ""}`;

// Genera una tarjeta de contacto estándar (vCard 3.0) que cualquier celular reconoce
// para ofrecer "Agregar a contactos" — es el único mecanismo real desde una web,
// ya que los navegadores no permiten escribir directo a la libreta de contactos.
export function contactoToVCard(c, agency) {
  const lineas = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${c.nombre}`,
    c.empresa ? `ORG:${c.empresa}` : "",
    c.profesion ? `TITLE:${c.profesion}` : "",
    c.telefono ? `TEL;TYPE=CELL:${c.telefono.replace(/[^\d+]/g, "")}` : "",
    c.correo ? `EMAIL:${c.correo}` : "",
    c.ciudad ? `ADR;TYPE=HOME:;;${c.ciudad};;;;` : "",
    `NOTE:Contacto de ${agency.nombreOficina} (${agency.nombreAgente}).${c.circulo ? ` Círculo: ${CIRCULO_LABEL[c.circulo]}.` : ""}`,
    "END:VCARD",
  ].filter(Boolean);
  return lineas.join("\n");
}

export async function guardarEnContactosDelCelular(contacto, agency) {
  const vcard = contactoToVCard(contacto, agency);
  const nombreArchivo = `${contacto.nombre.replace(/\s+/g, "_")}.vcf`;
  const blob = new Blob([vcard], { type: "text/vcard" });

  // En celular: intenta abrir la hoja nativa de compartir (permite elegir "Contactos" directamente).
  try {
    const file = new File([blob], nombreArchivo, { type: "text/vcard" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: contacto.nombre });
      return;
    }
  } catch (e) {
    // Si el usuario cancela o el navegador no soporta compartir archivos, seguimos con la descarga.
  }

  // Alternativa universal: descarga el .vcf; el teléfono lo abre con la app de Contactos.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
