import { Button } from "../../components/ui/index.js";
import { useAppData } from "../../context/AppDataContext.jsx";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";

export function FichaPropiedad({ open, onClose, captacion }) {
  const { agency } = useAppData();
  if (!open) return null;
  const c = captacion;
  const espacios = c.espacios || [];
  const espacioAmenidades = espacios.find((e) => e.id === "amenidades");
  const espaciosDeLaCasa = espacios.filter((e) => e.id !== "amenidades");

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

          {/* Pie */}
          <div className="mt-8 border-t border-black/10 pt-4">
            <p className="text-sm font-semibold text-gray-900">{agency.nombreAgente}</p>
            <p className="text-xs text-black/50">Asesor inmobiliario · {agency.nombreOficina}, {agency.ubicacion}</p>
            <p className="mt-2 text-[11px] text-black/35">Información sujeta a cambios sin previo aviso. Las características pueden variar según verificación final de la propiedad.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
