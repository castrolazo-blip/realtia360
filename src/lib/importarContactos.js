import { normalizarTelefono, indicePorTelefono } from "./telefono.js";

// Lee contactos desde un archivo CSV, Excel (.xlsx/.xls) o tarjetas de contacto (.vcf) y
// los separa en nuevos / ya existentes / sin teléfono válido. No guarda nada: eso pasa
// solo cuando el asesor confirma.

function parseCSV(txt) {
  const primera = txt.split("\n")[0] || "";
  const sep = primera.split(";").length > primera.split(",").length ? ";" : ",";
  const filas = [];
  let fila = [], cur = "", comillas = false;
  for (let i = 0; i < txt.length; i++) {
    const ch = txt[i];
    if (comillas) {
      if (ch === '"') {
        if (txt[i + 1] === '"') { cur += '"'; i++; } else comillas = false;
      } else cur += ch;
    } else if (ch === '"') comillas = true;
    else if (ch === sep) { fila.push(cur); cur = ""; }
    else if (ch === "\n") { fila.push(cur); filas.push(fila); fila = []; cur = ""; }
    else if (ch !== "\r") cur += ch;
  }
  if (cur || fila.length) { fila.push(cur); filas.push(fila); }
  return filas.filter((r) => r.some((x) => String(x).trim()));
}

// Detecta las columnas de nombre y teléfono por su encabezado; si no hay encabezado
// reconocible, asume columna 1 = nombre, columna 2 = teléfono.
function tablaAContactos(filas) {
  if (!filas.length) return [];
  const h = filas[0].map((x) => String(x || "").toLowerCase());
  let ni = h.findIndex((x) => /nombre|name|contacto|cliente/.test(x));
  let ti = [];
  h.forEach((x, i) => { if (/tel|cel|phone|m[oó]vil|whats|n[uú]mero/.test(x)) ti.push(i); });
  let datos = filas.slice(1);
  if (ni < 0 && !ti.length) { ni = 0; ti = [1]; datos = filas; }
  if (ni < 0) ni = h.findIndex((_, i) => !ti.includes(i));
  if (!ti.length) ti = [ni === 0 ? 1 : 0];
  return datos.map((r) => ({ nombre: String(r[ni] || "").trim(), telefonos: ti.map((i) => r[i]).filter(Boolean) }));
}

function parseVCF(txt) {
  const out = [];
  txt.replace(/\r\n[ \t]/g, "").split(/BEGIN:VCARD/i).slice(1).forEach((bloque) => {
    let nombre = "";
    const tels = [];
    bloque.split(/\r?\n/).forEach((l) => {
      const k = l.split(":")[0].toUpperCase();
      const v = l.slice(l.indexOf(":") + 1).trim();
      if (k.startsWith("FN")) nombre = v;
      else if (k.startsWith("N") && !k.startsWith("NOTE") && !nombre) nombre = v.split(";").filter(Boolean).reverse().join(" ");
      else if (k.startsWith("TEL") || k.includes(".TEL")) tels.push(v);
    });
    out.push({ nombre: nombre.replace(/\\,/g, ","), telefonos: tels });
  });
  return out;
}

// El lector de Excel (SheetJS) pesa ~900 KB: se descarga solo la primera vez que alguien
// importa un .xlsx, no con la app.
function cargarLectorExcel() {
  return new Promise((ok, ko) => {
    if (window.XLSX) return ok(window.XLSX);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    s.onload = () => ok(window.XLSX);
    s.onerror = () => ko(new Error("No se pudo cargar el lector de Excel"));
    document.head.appendChild(s);
  });
}

export async function leerArchivoContactos(file, contactosExistentes) {
  const nombre = file.name.toLowerCase();
  let crudos;
  if (nombre.endsWith(".vcf")) crudos = parseVCF(await file.text());
  else if (nombre.endsWith(".csv") || nombre.endsWith(".txt")) crudos = tablaAContactos(parseCSV(await file.text()));
  else {
    const XLSX = await cargarLectorExcel();
    const libro = XLSX.read(await file.arrayBuffer(), { type: "array" });
    const hoja = libro.Sheets[libro.SheetNames[0]];
    crudos = tablaAContactos(XLSX.utils.sheet_to_json(hoja, { header: 1, raw: false }));
  }

  const existentes = indicePorTelefono(contactosExistentes);
  const vistos = new Set();
  const nuevos = [];
  let repetidos = 0;
  let sinTelefono = 0;
  for (const r of crudos) {
    const tels = [...new Set((r.telefonos || []).map(normalizarTelefono).filter(Boolean))];
    if (!tels.length) { sinTelefono++; continue; }
    if (tels.some((t) => existentes[t] || vistos.has(t))) { repetidos++; continue; }
    tels.forEach((t) => vistos.add(t));
    nuevos.push({ nombre: r.nombre || tels[0], telefono: tels[0] });
  }
  return { archivo: file.name, nuevos, repetidos, sinTelefono };
}
