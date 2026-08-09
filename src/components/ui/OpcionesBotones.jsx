import { TarjetaSeleccion } from "./TarjetaSeleccion.jsx";

const COLUMNAS = { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" };

// Selector de una sola opción con botones grandes en vez de un <select> — se ve todo de
// un vistazo y no requiere abrir un menú desplegable ni acertarle a una flechita pequeña.
// Pensado para que cualquier persona, sin importar qué tan cómoda esté con formularios
// digitales, pueda usarlo con el dedo sin dificultad.
export function OpcionesBotones({ opciones, valor, onChange, columnas = 2 }) {
  return (
    <div className={`grid gap-2 ${COLUMNAS[columnas] || COLUMNAS[2]}`}>
      {opciones.map((op) => (
        <TarjetaSeleccion key={op.value} seleccionado={valor === op.value} onClick={() => onChange(op.value)} className="justify-center py-3 text-center">
          <span className="text-sm font-semibold text-gray-800">
            {op.emoji ? `${op.emoji} ` : ""}
            {op.label}
          </span>
        </TarjetaSeleccion>
      ))}
    </div>
  );
}
