import { Modal, Badge } from "../../components/ui/index.js";
import { TIPO_INMUEBLE_LABEL, OPERACION_INMUEBLE_LABEL, DISPONIBILIDAD_LABEL, DISPONIBILIDAD_TONE } from "../../constants/captacion.js";
import { formatMoney } from "../../lib/format.js";

// Vista de solo lectura de una propiedad publicada — usada tanto para la propia cartera
// como para las de compañeros de oficina, así que deliberadamente no muestra datos del
// propietario (contacto): eso sigue siendo privado del agente que la captó.
export function PropiedadDetalleModal({ propiedad, asesorNombre, onClose }) {
  if (!propiedad) return null;
  const p = propiedad;
  const espacios = p.espacios || [];
  const amenidades = espacios.find((e) => e.id === "amenidades");
  const espaciosDeLaCasa = espacios.filter((e) => e.id !== "amenidades");

  return (
    <Modal open onClose={onClose} title={`${TIPO_INMUEBLE_LABEL[p.tipoInmueble]} · ${OPERACION_INMUEBLE_LABEL[p.operacion]}`}>
      <div className="flex flex-col gap-5">
        <div>
          <Badge className={DISPONIBILIDAD_TONE[p.disponibilidad]}>{DISPONIBILIDAD_LABEL[p.disponibilidad]}</Badge>
          <p className="mt-1.5 text-sm font-semibold text-gray-900">{p.direccion}</p>
          <p className="text-xs text-black/45">{p.zona}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Precio</p>
            <p className="text-sm font-semibold text-gray-900">{formatMoney(p.precio)}</p>
          </div>
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Asesor responsable</p>
            <p className="text-sm font-semibold text-gray-900">{asesorNombre}</p>
          </div>
        </div>

        {espaciosDeLaCasa.some((e) => e.cantidad != null) && (
          <div className="flex flex-wrap gap-4 rounded-xl bg-gray-50 p-3.5">
            {espaciosDeLaCasa.filter((e) => e.cantidad != null).map((e) => (
              <div key={e.id} className="text-center">
                <p className="text-lg font-bold text-gray-900">{e.cantidad}</p>
                <p className="text-[11px] text-black/45">{e.nombre}</p>
              </div>
            ))}
          </div>
        )}

        {amenidades && amenidades.caracteristicas.length > 0 && (
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Amenidades</h3>
            <div className="flex flex-wrap gap-1.5">
              {amenidades.caracteristicas.map((car, i) => (
                <Badge key={i} className="bg-brand-50 text-brand-700">{car.tipo === "texto" ? `${car.nombre}: ${car.valor}` : car.nombre}</Badge>
              ))}
            </div>
          </div>
        )}

        {p.descripcionIA && (
          <div>
            <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-black/40">Descripción</h3>
            <p className="whitespace-pre-line text-sm text-gray-700">{p.descripcionIA}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
