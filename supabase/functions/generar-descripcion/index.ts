// Genera una descripción lista para publicar en redes sociales a partir del resumen de una
// propiedad captada. Vive como función de Supabase (no en el navegador) para que la clave de
// la API de Claude nunca quede expuesta en el código del cliente — la seguridad real de este
// endpoint la da verify_jwt (solo agentes autenticados de Realtia pueden llamarlo).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function construirInstrucciones(asesor) {
  const nombre = (asesor?.nombre || "").trim();
  const telefono = (asesor?.telefono || "").trim();
  let lineaContacto;
  if (nombre && telefono) {
    lineaContacto = `- Termina con una llamada a la acción breve invitando a escribir o agendar visita, y cierra
  la publicación con el contacto del asesor en su propia línea, tal cual: "${nombre} · ${telefono}".`;
  } else if (nombre) {
    lineaContacto = `- Termina con una llamada a la acción breve invitando a escribir o agendar visita, y cierra
  la publicación con el nombre del asesor en su propia línea: "${nombre}".`;
  } else {
    lineaContacto = `- Termina con una llamada a la acción breve invitando a escribir o agendar visita.`;
  }

  return `Eres un asesor inmobiliario experto en marketing digital en Centroamérica (tono
cálido, profesional, sin exagerar). A partir de la ficha técnica de una propiedad que te paso
abajo, escribe UNA publicación lista para copiar y pegar en Instagram/Facebook.

Reglas:
- Español neutro centroamericano, cercano pero profesional.
- Empieza con un titular corto y llamativo (una línea, con 1-2 emojis relevantes).
- 2 a 4 frases de cuerpo destacando lo más atractivo de la propiedad (no repitas
  mecánicamente cada dato de la ficha, elige lo más vendedor).
${lineaContacto}
- Agrega al final una línea con 5 a 8 hashtags relevantes en español (sin espacios dentro de
  cada hashtag).
- No inventes datos que no estén en la ficha (no inventes dirección exacta si no se dio, no
  inventes amenidades que no aparecen, no inventes el nombre o teléfono del asesor si no se
  te dieron).
- No uses markdown (nada de **negrita** ni encabezados), solo texto plano con saltos de línea,
  como se pegaría directo en una red social.

Ficha de la propiedad:
`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const { resumen, asesor } = await req.json();
    if (!resumen || typeof resumen !== "string") {
      return new Response(JSON.stringify({ error: "Falta el resumen de la propiedad." }), {
        status: 400,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Falta configurar la clave ANTHROPIC_API_KEY en los secretos del proyecto de Supabase." }),
        { status: 500, headers: { ...CORS, "Content-Type": "application/json" } }
      );
    }

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 700,
        messages: [{ role: "user", content: construirInstrucciones(asesor) + resumen }],
      }),
    });

    if (!resp.ok) {
      const detalle = await resp.text();
      return new Response(JSON.stringify({ error: `El servicio de IA respondió con error: ${detalle}` }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    // No asumimos que el primer bloque es el de texto: algunos modelos devuelven antes un
    // bloque de tipo "thinking" (razonamiento interno) que no trae el texto final.
    const bloqueTexto = (data?.content || []).find((b) => b.type === "text");
    const texto = bloqueTexto?.text?.trim() || "";
    if (!texto) {
      return new Response(JSON.stringify({ error: "La IA no devolvió texto. Intenta de nuevo." }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ descripcion: texto }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
