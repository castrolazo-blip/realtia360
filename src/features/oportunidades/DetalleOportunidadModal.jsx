import { useState } from "react";
import { Modal, Field, Badge, OpcionesBotones } from "../../components/ui/index.js";
import { TIPO_OP_LABEL, ETAPA_LABEL, ETAPAS } from "../../constants/oportunidades.js";
import { formatMoney } from "../../lib/format.js";
import { formatDia, formatHora } from "../../lib/dates.js";
import { CrearOportunidadModal } from "./CrearOportunidadModal.jsx";
import { CerrarModal } from "./CerrarModal.jsx";

const OPCIONES_ETAPA = ETAPAS.map((e) => ({ value: e, label: ETAPA_LABEL[e] }));

export function DetalleOportunidadModal({ id, oportunidades, contactos, contactoNombre, onClose, onAbrirContacto, onActualizar, onCerrar }) {
  const [editando, setEditando] = useState(false);
  const [cerrarAbierto, setCerrarAbierto] = useState(false);
  const o = oportunidades.find((x) => x.id === id);
  if (!id || !o) return null;

  return (
    <Modal open onClose={onClose} title={`${TIPO_OP_LABEL[o.tipo]} · ${contactoNombre(o.contactoId)}`}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-brand-50 text-brand-700">{TIPO_OP_LABEL[o.tipo]}</Badge>
            {o.estado !== "activa" && <Badge className={o.estado === "ganada" ? "bg-brand-100 text-brand-700" : "bg-black/5 text-black/60"}>{o.estado}</Badge>}
            {o.zona && <Badge>{o.zona}</Badge>}
          </div>
          <button onClick={() => setEditando(true)} className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200">
            ✏️ Editar
          </button>
        </div>

        <button
          onClick={() => { onClose(); onAbrirContacto(o.contactoId); }}
          className="flex items-center justify-between rounded-xl border border-black/10 px-3 py-2.5 text-left hover:bg-gray-50"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
              {contactoNombre(o.contactoId).charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold text-gray-900">{contactoNombre(o.contactoId)}</p>
              <p className="text-[11px] text-black/40">Contacto</p>
            </div>
          </div>
          <span className="text-xs font-medium text-brand-700">Ver expediente →</span>
        </button>

        <div className="rounded-xl bg-gray-100 p-3">
          <p className="text-xs text-black/45">Valor estimado</p>
          <p className="text-lg font-bold text-gray-900">{formatMoney(o.valor)}</p>
        </div>

        {o.estado === "activa" ? (
          <Field label="Etapa">
            <OpcionesBotones columnas={2} opciones={OPCIONES_ETAPA} valor={o.etapa} onChange={(etapa) => onActualizar(o.id, { etapa })} />
          </Field>
        ) : (
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Etapa al cierre</p>
            <p className="text-sm font-semibold text-gray-900">{ETAPA_LABEL[o.etapa]}</p>
          </div>
        )}

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-black/40">Próxima acción</h3>
          {o.proximaAccion ? (
            <p className="text-sm text-gray-800">
              {o.proximaAccion}
              {o.proximaFecha && <span className="text-black/40"> · {formatDia(o.proximaFecha)}, {formatHora(o.proximaFecha)}</span>}
            </p>
          ) : (
            <p className="text-sm font-medium text-rose-600">Sin próxima acción</p>
          )}
        </div>

        {o.estado !== "activa" && o.motivoCierre && (
          <div>
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-black/40">Motivo de cierre</h3>
            <p className="text-sm text-gray-700">{o.motivoCierre}</p>
          </div>
        )}

        {o.estado === "activa" && (
          <button onClick={() => setCerrarAbierto(true)} className="self-start text-sm font-semibold text-rose-600 hover:text-rose-700">
            Cerrar oportunidad…
          </button>
        )}
      </div>

      <CrearOportunidadModal
        open={editando} onClose={() => setEditando(false)} contactos={contactos}
        oportunidadEditar={o} onGuardarEdicion={onActualizar}
      />
      <CerrarModal
        id={cerrarAbierto ? o.id : null} onClose={() => setCerrarAbierto(false)}
        onCerrar={(estado, motivo) => { onCerrar(o.id, estado, motivo); setCerrarAbierto(false); onClose(); }}
      />
    </Modal>
  );
}
