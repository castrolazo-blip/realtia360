// Compara un nombre contra la lista pública de sancionados de OFAC (SDN — Specially
// Designated Nationals, Departamento del Tesoro de EE.UU.), la misma fuente que usan
// muchas herramientas de cumplimiento comerciales. Es gratuita y no requiere clave — no
// hace falta contratar un proveedor pago para tener un primer filtro real.
//
// Coincidencia por similitud de texto (no exacta): nombres reales rara vez están escritos
// idéntico en dos fuentes distintas (acentos, orden, segundo apellido). Se normaliza y se
// compara por palabras en común — es una heurística, no un veredicto: toda coincidencia
// queda para que la revise una persona, nunca se auto-rechaza a nadie.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SDN_CSV_URL = "https://www.treasury.gov/ofac/downloads/sdn.csv";

function normalizar(s: string) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length > 2); // ignora partículas cortas (de, la, jr, etc.)
}

function similitud(nombreBuscado: string[], nombreLista: string[]) {
  if (nombreBuscado.length === 0 || nombreLista.length === 0) return 0;
  const setLista = new Set(nombreLista);
  const coincidencias = nombreBuscado.filter((p) => setLista.has(p)).length;
  return coincidencias / Math.max(nombreBuscado.length, 2); // pide al menos 2 palabras en común para no marcar por una sola coincidencia trivial
}

// Parser simple de CSV: el archivo de OFAC no trae comillas anidadas complejas, alcanza
// con separar por comas respetando comillas dobles.
function parseCsvLine(line: string): string[] {
  const campos: string[] = [];
  let actual = "";
  let entreComillas = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { entreComillas = !entreComillas; continue; }
    if (ch === "," && !entreComillas) { campos.push(actual); actual = ""; continue; }
    actual += ch;
  }
  campos.push(actual);
  return campos;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { nombre } = await req.json();
    if (!nombre || typeof nombre !== "string") {
      return new Response(JSON.stringify({ error: "Falta el nombre a verificar." }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const resp = await fetch(SDN_CSV_URL);
    if (!resp.ok) {
      return new Response(JSON.stringify({ error: "No se pudo descargar la lista OFAC en este momento. Intenta de nuevo." }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    const texto = await resp.text();
    const palabrasBuscadas = normalizar(nombre);

    const coincidencias: { nombre: string; tipo: string; programa: string; similitud: number }[] = [];
    for (const linea of texto.split("\n")) {
      if (!linea.trim()) continue;
      const campos = parseCsvLine(linea);
      // Columnas del SDN.csv: ent_num, SDN_Name, SDN_Type, Program, Title, Call_Sign, Vess_type, Tonnage, GRT, Vess_flag, Vess_owner, Remarks
      const nombreEntrada = campos[1] || "";
      const tipo = campos[2] || "";
      const programa = campos[3] || "";
      const puntaje = similitud(palabrasBuscadas, normalizar(nombreEntrada));
      if (puntaje >= 0.6) {
        coincidencias.push({ nombre: nombreEntrada.trim(), tipo: tipo.trim(), programa: programa.trim(), similitud: Math.round(puntaje * 100) });
      }
    }
    coincidencias.sort((a, b) => b.similitud - a.similitud);

    return new Response(
      JSON.stringify({
        coincidencia: coincidencias.length > 0,
        resultados: coincidencias.slice(0, 5),
        fuente: "OFAC SDN List (Departamento del Tesoro de EE. UU.)",
        verificadoEn: new Date().toISOString(),
      }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
