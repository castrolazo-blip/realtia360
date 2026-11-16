import { useState } from "react";
import { TIPO_INMUEBLE_LABEL } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";

// Piezas visuales compartidas por la lista y la ficha de propiedades.

export const tituloPropiedad = (p) => {
  const tipo = TIPO_INMUEBLE_LABEL[p.tipoInmueble] || "Propiedad";
  return p.zona ? `${tipo} en ${p.zona}` : p.direccion || tipo;
};

export const portada = (p) => (p.fotos || [])[0]?.url || null;

export function Precio({ p, className = "" }) {
  return (
    <p className={`font-bold text-ink-950 ${className}`}>
      {formatMoney(p.precio)}
      {p.operacion === "alquiler" && <span className="text-xs font-medium text-black/45"> /mes</span>}
    </p>
  );
}

// Favoritas: solo para comodidad de quien mira, se guardan en este dispositivo.
const CLAVE_FAV = "realtia-favoritas";
const leerFavoritas = () => {
  try { return new Set(JSON.parse(localStorage.getItem(CLAVE_FAV) || "[]")); } catch { return new Set(); }
};
export function useFavoritas() {
  const [favs, setFavs] = useState(leerFavoritas);
  function alternar(id) {
    setFavs((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      try { localStorage.setItem(CLAVE_FAV, JSON.stringify([...n])); } catch { /* sin almacenamiento local */ }
      return n;
    });
  }
  return [favs, alternar];
}

export function BotonCorazon({ activo, onClick, className = "" }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      aria-label={activo ? "Quitar de favoritas" : "Agregar a favoritas"}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm ${className}`}
    >
      <svg viewBox="0 0 24 24" className={`h-[18px] w-[18px] ${activo ? "fill-rose-500 stroke-rose-500" : "fill-none stroke-ink-950"}`} strokeWidth="2" strokeLinejoin="round">
        <path d="M12 20s-7-4.4-9.2-8.6C1.3 8.5 3 5 6.4 5c2 0 3.2 1.1 3.9 2.2h3.4C14.4 6.1 15.6 5 17.6 5 21 5 22.7 8.5 21.2 11.4 19 15.6 12 20 12 20z" />
      </svg>
    </button>
  );
}

export function IconoPin({ className = "h-3.5 w-3.5" }) {
  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0 fill-black/30`}>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" />
    </svg>
  );
}

// Iconos de categoría (tipo de inmueble), trazo grueso como el resto de la app.
const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
export const ICONO_TIPO = {
  todas: (c) => <svg viewBox="0 0 24 24" className={c} {...trazo}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>,
  casa: (c) => <svg viewBox="0 0 24 24" className={c} {...trazo}><path d="M3 11l9-7 9 7" /><path d="M5 10v10h14V10" /><path d="M10 20v-5h4v5" /></svg>,
  apartamento: (c) => <svg viewBox="0 0 24 24" className={c} {...trazo}><rect x="5" y="3" width="14" height="18" rx="1.5" /><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M11 21v-3h2v3" /></svg>,
  terreno: (c) => <svg viewBox="0 0 24 24" className={c} {...trazo}><path d="M3 19l5-9 4 6 3-4 6 7z" /><circle cx="17" cy="6" r="2" /></svg>,
  local: (c) => <svg viewBox="0 0 24 24" className={c} {...trazo}><path d="M4 9l1.5-5h13L20 9" /><path d="M4 9h16v2a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1-5 0z" /><path d="M5 13v7h14v-7M10 20v-4h4v4" /></svg>,
  oficina: (c) => <svg viewBox="0 0 24 24" className={c} {...trazo}><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" /></svg>,
};

export function ImagenPropiedad({ p, className = "" }) {
  const url = portada(p);
  if (url) return <img src={url} alt={tituloPropiedad(p)} loading="lazy" className={`object-cover ${className}`} />;
  const Ico = ICONO_TIPO[p.tipoInmueble] || ICONO_TIPO.casa;
  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-ink-800 via-ink-700 to-brand-800 text-white/35 ${className}`}>
      {Ico("h-10 w-10")}
    </div>
  );
}
