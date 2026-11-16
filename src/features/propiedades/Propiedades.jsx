import { useMemo, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { EmptyState } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { TIPO_INMUEBLE_LABEL, DISPONIBILIDAD_LABEL } from "../../constants/captacion.js";
import { PropiedadDetalle } from "./PropiedadDetalleModal.jsx";
import { tituloPropiedad, Precio, ImagenPropiedad, BotonCorazon, IconoPin, ICONO_TIPO, useFavoritas } from "./ui.jsx";

const CATEGORIAS = ["todas", ...Object.keys(TIPO_INMUEBLE_LABEL)];
const OPERACIONES = [["todas", "Todas"], ["venta", "Venta"], ["alquiler", "Alquiler"], ["favoritas", "♥ Favoritas"]];
// Espeja las carpetas de Drive de la oficina: Disponibles primero, luego el histórico.
const DISPONIBILIDADES = [["disponible", "Disponibles"], ["reservada", "Reservadas"], ["cerrada", "Cerradas"], ["no_disponible", "No disponibles"], ["todas", "Todas"]];

export function Propiedades() {
  const { propiedadesOficina, nombreAgente, agency } = useAppData();
  const [q, setQ] = useState("");
  const [tipo, setTipo] = useState("todas");
  const [operacion, setOperacion] = useState("todas");
  const [disponibilidad, setDisponibilidad] = useState("disponible");
  const [verFiltros, setVerFiltros] = useState(false);
  const [detalleId, setDetalleId] = useState(null);
  const [favs, alternarFav] = useFavoritas();

  const visibles = useMemo(() => {
    const texto = q.trim().toLowerCase();
    return propiedadesOficina
      .filter((p) => tipo === "todas" || p.tipoInmueble === tipo)
      .filter((p) => operacion === "todas" || (operacion === "favoritas" ? favs.has(p.id) : p.operacion === operacion))
      .filter((p) => disponibilidad === "todas" || p.disponibilidad === disponibilidad)
      .filter((p) => !texto || [p.zona, p.direccion, TIPO_INMUEBLE_LABEL[p.tipoInmueble]].some((x) => (x || "").toLowerCase().includes(texto)));
  }, [propiedadesOficina, q, tipo, operacion, disponibilidad, favs]);

  const recientes = visibles.slice(0, 8);
  const seleccionada = propiedadesOficina.find((p) => p.id === detalleId);

  return (
    <div>
      <p className="text-xs font-medium text-black/45">Inventario de</p>
      <div className="mb-4 flex items-center gap-1.5">
        <IconoPin className="h-4 w-4 fill-ink-950" />
        <h1 className="text-lg font-bold text-ink-950">{agency.nombreOficina}{agency.ubicacion ? `, ${agency.ubicacion}` : ""}</h1>
      </div>

      <div className="mb-5 flex items-center gap-2.5">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-3 shadow-sm">
          <Icon.Search className="h-[18px] w-[18px] text-black/40" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar zona o dirección" className="min-w-0 flex-1 bg-transparent text-base outline-none" />
        </div>
        <button
          onClick={() => setVerFiltros((v) => !v)}
          aria-label="Filtros"
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${verFiltros ? "bg-brand-700" : "bg-ink-950"} text-white shadow-sm`}
        >
          <Icon.Filter className="h-5 w-5" />
        </button>
      </div>

      {verFiltros && (
        <div className="mb-5 rounded-3xl border border-black/5 bg-white p-4 shadow-card">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Operación</p>
          <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {OPERACIONES.map(([k, l]) => <Pastilla key={k} activo={operacion === k} onClick={() => setOperacion(k)}>{l}</Pastilla>)}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Disponibilidad</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {DISPONIBILIDADES.map(([k, l]) => <Pastilla key={k} activo={disponibilidad === k} onClick={() => setDisponibilidad(k)}>{l}</Pastilla>)}
          </div>
        </div>
      )}

      {/* Categorías por tipo de inmueble */}
      <div className="-mx-4 mb-6 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:px-0">
        {CATEGORIAS.map((k) => (
          <button key={k} onClick={() => setTipo(k)} className="flex w-[72px] shrink-0 flex-col items-center gap-1.5">
            <span className={`flex h-16 w-16 items-center justify-center rounded-full border transition ${tipo === k ? "border-ink-950 bg-ink-950 text-white" : "border-black/10 bg-white text-ink-950 shadow-sm"}`}>
              {ICONO_TIPO[k]("h-7 w-7")}
            </span>
            <span className={`text-xs ${tipo === k ? "font-bold text-ink-950" : "font-medium text-black/60"}`}>{k === "todas" ? "Todas" : TIPO_INMUEBLE_LABEL[k].replace(" comercial", "")}</span>
          </button>
        ))}
      </div>

      {visibles.length === 0 ? (
        <EmptyState
          title="Sin propiedades aquí"
          hint="Cuando una captación llegue a Publicada aparece acá para toda la oficina. Prueba con otra categoría o filtro."
        />
      ) : (
        <>
          <Seccion titulo="Recién publicadas" />
          <div className="-mx-4 mb-7 flex snap-x gap-3.5 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
            {recientes.map((p) => (
              <Tarjeta key={p.id} onAbrir={() => setDetalleId(p.id)} className="w-[230px] shrink-0 snap-start p-2.5">
                <div className="relative">
                  <ImagenPropiedad p={p} className="h-40 w-full rounded-2xl" />
                  <BotonCorazon activo={favs.has(p.id)} onClick={() => alternarFav(p.id)} className="absolute right-2 top-2" />
                  {p.disponibilidad !== "disponible" && <EtiquetaEstado p={p} />}
                </div>
                <div className="px-1 pb-1 pt-2.5">
                  <Etiqueta>{TIPO_INMUEBLE_LABEL[p.tipoInmueble]}</Etiqueta>
                  <p className="mt-1.5 truncate text-[15px] font-bold text-ink-950">{tituloPropiedad(p)}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-black/50"><IconoPin />{p.direccion || p.zona || "Sin dirección"}</p>
                  <Precio p={p} className="mt-1.5 text-base" />
                </div>
              </Tarjeta>
            ))}
          </div>

          <Seccion titulo={`Todo el inventario · ${visibles.length}`} />
          <div className="grid gap-3 lg:grid-cols-2">
            {visibles.map((p) => (
              <Tarjeta key={p.id} onAbrir={() => setDetalleId(p.id)} className="flex items-stretch gap-3 p-2.5">
                <div className="relative w-[42%] shrink-0">
                  <ImagenPropiedad p={p} className="h-full min-h-[118px] w-full rounded-2xl" />
                  <BotonCorazon activo={favs.has(p.id)} onClick={() => alternarFav(p.id)} className="absolute right-1.5 top-1.5 h-8 w-8" />
                </div>
                <div className="min-w-0 flex-1 py-1 pr-1">
                  <div className="flex flex-wrap gap-1">
                    <Etiqueta>{TIPO_INMUEBLE_LABEL[p.tipoInmueble]}</Etiqueta>
                    {p.disponibilidad !== "disponible" && <Etiqueta tono="bg-gold-100 text-gold-700">{DISPONIBILIDAD_LABEL[p.disponibilidad]}</Etiqueta>}
                  </div>
                  <p className="mt-1.5 truncate text-[15px] font-bold text-ink-950">{tituloPropiedad(p)}</p>
                  <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-black/50"><IconoPin />{p.direccion || p.zona || "Sin dirección"}</p>
                  <Precio p={p} className="mt-1.5 text-base" />
                  <p className="mt-1 truncate text-[11px] text-black/40">Asesor: {nombreAgente(p.agenteId)}</p>
                </div>
              </Tarjeta>
            ))}
          </div>
        </>
      )}

      {seleccionada && <PropiedadDetalle propiedad={seleccionada} esFavorita={favs.has(seleccionada.id)} onFavorita={() => alternarFav(seleccionada.id)} onClose={() => setDetalleId(null)} />}
    </div>
  );
}

// Tarjeta tocable (no es <button> porque adentro va el botón de favorita).
function Tarjeta({ onAbrir, className = "", children }) {
  return (
    <div
      role="button" tabIndex={0} onClick={onAbrir}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onAbrir())}
      className={`cursor-pointer rounded-3xl border border-black/5 bg-white text-left shadow-card outline-none transition hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ink-950 ${className}`}
    >
      {children}
    </div>
  );
}

function Seccion({ titulo }) {
  return <h2 className="mb-3 text-lg font-bold text-ink-950">{titulo}</h2>;
}

function Etiqueta({ children, tono = "bg-gray-100 text-black/60" }) {
  return <span className={`inline-block rounded-md px-2 py-0.5 text-[10.5px] font-semibold ${tono}`}>{children}</span>;
}

function EtiquetaEstado({ p }) {
  return <span className="absolute bottom-2 left-2 rounded-full bg-ink-950/85 px-2.5 py-1 text-[11px] font-semibold text-white">{DISPONIBILIDAD_LABEL[p.disponibilidad]}</span>;
}

function Pastilla({ activo, onClick, children }) {
  return (
    <button onClick={onClick} className={`min-h-[44px] rounded-full px-3 text-sm font-semibold transition ${activo ? "bg-ink-950 text-white" : "border border-black/10 bg-white text-black/60"}`}>
      {children}
    </button>
  );
}
