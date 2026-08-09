import { useState } from "react";
import { Button } from "../../components/ui/index.js";
import { useAppData } from "../../context/AppDataContext.jsx";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";
import { generarDescripcionIA } from "./descripcionIA.js";

export function FichaPropiedad({ open, onClose, captacion, onGuardarDescripcionIA }) {
  const { agency } = useAppData();
  const [paso, setPaso] = useState("pregunta"); // 'pregunta' | 'ficha' — solo se pregunta la primera vez
  const [descripcion, setDescripcion] = useState("");
  const [cargado, setCargado] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [errorIA, setErrorIA] = useState("");
  const [copiado, setCopiado] = useState(false);

  if (open && !cargado) {
    setDescripcion(captacion?.descripcionIA || "");
    // Si ya se había generado (o decidido) antes, no se vuelve a preguntar.
    setPaso(captacion?.descripcionIA ? "ficha" : "pregunta");
    setCargado(true);
  }
  if (!open) {
    if (cargado) setCargado(false);
    return null;
  }

  const c = captacion;
  const espacios = c.espacios || [];
  const espacioAmenidades = espacios.find((e) => e.id === "amenidades");
  const espaciosDeLaCasa = espacios.filter((e) => e.id !== "amenidades");

  async function generar() {
    setGenerando(true);
    setErrorIA("");
    try {
      const texto = await generarDescripcionIA(c, agency);
      setDescripcion(texto);
      await onGuardarDescripcionIA?.(c.id, texto);
      setPaso("ficha");
    } catch (err) {
      setErrorIA(err.message || "No se pudo generar la descripción.");
    } finally {
      setGenerando(false);
    }
  }

  function continuarSinIA() {
    setErrorIA("");
    setPaso("ficha");
  }

  function guardarEdicion() {
    if (descripcion !== (c.descripcionIA || "")) onGuardarDescripcionIA?.(c.id, descripcion);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(descripcion);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // el navegador negó el acceso al portapapeles; el texto sigue disponible para copiar a mano
    }
  }

  if (paso === "pregunta") {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
          <h2 className="font-display text-lg font-bold text-gray-900">✨ ¿Generar descripción con IA?</h2>
          <p className="mt-2 text-sm text-black/60">
            La inteligencia artificial puede redactar una descripción de la propiedad lista para publicar en
            redes sociales, con tu nombre y teléfono al final para que te contacten. Quedará incluida en la
            ficha y podrás editarla después.
          </p>

          {errorIA && <p className="mt-3 text-sm text-rose-600">{errorIA}</p>}

          <div className="mt-6 flex flex-col gap-2.5">
            <Button onClick={generar} disabled={generando} className="!py-3">
              {generando ? "Generando…" : "Sí, generar con IA"}
            </Button>
            <button
              onClick={continuarSinIA}
              disabled={generando}
              className="rounded-2xl py-3 text-sm font-semibold text-black/50 hover:bg-black/5"
            >
              Continuar sin IA
            </button>
          </div>
          <button onClick={onClose} className="mt-4 w-full text-center text-xs text-black/35 hover:text-black/50">
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/40">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #ficha-imprimible, #ficha-imprimible * { visibility: visible; }
          #ficha-imprimible { position: absolute; inset: 0; width: 100%; }
          .no-imprimir { display: none !important; }
        }
      `}</style>

      <div className="no-imprimir flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <button onClick={onClose} className="rounded-full p-1.5 text-black/40 hover:bg-black/5">✕ Cerrar</button>
        <Button onClick={() => window.print()}>🖨️ Imprimir / Guardar PDF</Button>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <div id="ficha-imprimible" className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-lg sm:p-10">
          {/* Encabezado */}
          <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700">{agency.nombreOficina}</p>
              <p className="text-[11px] text-black/40">Ficha de propiedad</p>
            </div>
            <p className="text-[11px] text-black/40">{new Date().toLocaleDateString("es-SV", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>

          {/* Título y precio */}
          <h1 className="font-display text-2xl font-bold text-gray-900">{TIPO_INMUEBLE_LABEL[c.tipoInmueble]} en {OPERACION_INMUEBLE_LABEL[c.operacion]}</h1>
          <p className="mt-1 text-base text-gray-600">{c.direccion}{c.zona ? ` · ${c.zona}` : ""}</p>
          <p className="mt-3 text-3xl font-black text-brand-700">{formatMoney(c.precio)}</p>

          {/* Resumen rápido de espacios con cantidad */}
          {espaciosDeLaCasa.some((e) => e.cantidad != null) && (
            <div className="mt-5 flex flex-wrap gap-4 border-y border-black/10 py-4">
              {espaciosDeLaCasa.filter((e) => e.cantidad != null).map((e) => (
                <div key={e.id} className="text-center">
                  <p className="text-xl font-black text-gray-900">{e.cantidad}</p>
                  <p className="text-xs text-black/50">{e.nombre}</p>
                </div>
              ))}
            </div>
          )}

          {/* Detalle de cada espacio */}
          {espaciosDeLaCasa.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900">Espacios y características</h2>
              <div className="flex flex-col gap-4">
                {espaciosDeLaCasa.map((e) => (
                  <div key={e.id}>
                    <p className="mb-1.5 text-sm font-bold text-gray-800">{e.icono} {e.nombre}</p>
                    {e.contadores && e.contadores.some((ct) => ct.unidades && ct.unidades.length > 0) ? (
                      <div className="flex flex-col gap-1.5 pl-1">
                        {e.contadores.filter((ct) => ct.unidades).flatMap((ct) => ct.unidades).map((u, i) => (
                          <div key={i} className="text-sm text-gray-700">
                            <span className="font-medium">{u.etiqueta}:</span>{" "}
                            {u.caracteristicas.length === 0 ? <span className="text-black/40">sin detalles adicionales</span> : u.caracteristicas.map((car) => (car.tipo === "texto" ? `${car.nombre}: ${car.valor}` : car.nombre)).join(" · ")}
                          </div>
                        ))}
                      </div>
                    ) : e.caracteristicas.length > 0 ? (
                      <p className="pl-1 text-sm text-gray-700">{e.caracteristicas.map((car) => (car.tipo === "texto" ? `${car.nombre}: ${car.valor}` : car.nombre)).join(" · ")}</p>
                    ) : (
                      <p className="pl-1 text-sm text-black/40">Sin características adicionales registradas.</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenidades */}
          {espacioAmenidades && espacioAmenidades.caracteristicas.length > 0 && (
            <div className="mt-6">
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-900">Amenidades</h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                {espacioAmenidades.caracteristicas.map((car, i) => (
                  <p key={i} className="text-sm text-gray-700">✓ {car.tipo === "texto" ? `${car.nombre}: ${car.valor}` : car.nombre}</p>
                ))}
              </div>
            </div>
          )}

          {espacios.length === 0 && (
            <p className="mt-6 rounded-xl border border-dashed border-black/10 px-4 py-6 text-center text-sm text-black/40">
              Todavía no se registraron espacios ni características para esta propiedad.
            </p>
          )}

          {/* Descripción (generada con IA o escrita a mano) — forma parte de la ficha impresa */}
          {descripcion && (
            <div className="mt-6 border-t border-black/10 pt-5">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-gray-900">Descripción</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{descripcion}</p>
            </div>
          )}

          {/* Pie */}
          <div className="mt-8 border-t border-black/10 pt-4">
            <p className="text-sm font-semibold text-gray-900">{agency.nombreAgente}</p>
            <p className="text-xs text-black/50">
              Asesor inmobiliario · {agency.nombreOficina}, {agency.ubicacion}
              {agency.telefono ? ` · ${agency.telefono}` : ""}
            </p>
            <p className="mt-2 text-[11px] text-black/35">Información sujeta a cambios sin previo aviso. Las características pueden variar según verificación final de la propiedad.</p>
          </div>
        </div>

        {/* Edición de la descripción — no forma parte de la ficha impresa, solo el panel de control */}
        <div className="no-imprimir mx-auto mt-4 max-w-xl rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-indigo-900">✨ Descripción para redes sociales</h2>
            <Button variant="secondary" onClick={generar} disabled={generando} className="!px-3 !py-1.5 text-xs">
              {generando ? "Generando…" : descripcion ? "Regenerar" : "Generar con IA"}
            </Button>
          </div>

          {errorIA && <p className="mb-3 text-xs text-rose-600">{errorIA}</p>}

          {descripcion ? (
            <>
              <textarea
                className="w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-base text-gray-900 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
                rows={8}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                onBlur={guardarEdicion}
              />
              <div className="mt-2 flex justify-end">
                <Button variant="secondary" onClick={copiar} className="!px-3 !py-1.5 text-xs">
                  {copiado ? "¡Copiado!" : "Copiar"}
                </Button>
              </div>
            </>
          ) : (
            !generando && (
              <p className="text-sm text-indigo-900/60">
                Genera una publicación lista para copiar en Instagram o Facebook, a partir de los datos de esta ficha.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
