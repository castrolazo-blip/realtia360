import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Modal, Badge, Button, inputClass } from "../../components/ui/index.js";
import { TONE_BY_CLASIFICACION, CLASIFICACION_LABEL, CIRCULO_LABEL, CIRCULO_EMOJI } from "../../constants/contactos.js";
import { TIPO_OP_LABEL, ETAPA_LABEL } from "../../constants/oportunidades.js";
import { diasDesde, haceTiempo, formatCumple } from "../../lib/dates.js";
import { guardarEnContactosDelCelular } from "../../lib/contacts.js";
import { ContactoQuickButtons } from "../../components/shared/ContactoQuickButtons.jsx";

export function DetalleContactoModal() {
  const { expedienteId: id, contactos, oportunidades, actividades, cerrarExpediente, registrarContacto, agregarNota, agency } = useAppData();
  const [notaNueva, setNotaNueva] = useState("");
  const c = contactos.find((x) => x.id === id);

  if (!id || !c) return null;
  const ops = oportunidades.filter((o) => o.contactoId === id);
  const acts = actividades.filter((a) => a.contactoId === id);
  const notas = c.notas || [];

  function guardarNota() {
    if (!notaNueva.trim()) return;
    agregarNota(c.id, notaNueva.trim());
    setNotaNueva("");
  }

  return (
    <Modal open onClose={cerrarExpediente} title={c.nombre}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          <Badge className={TONE_BY_CLASIFICACION[c.clasificacion]}>{CLASIFICACION_LABEL[c.clasificacion]}</Badge>
          {c.valorEstrategico === "vip" && <Badge className="bg-gold-100 text-gold-700">⭐ VIP</Badge>}
          {c.ciudad && <Badge>{c.ciudad}</Badge>}
          {c.empresa && <Badge>{c.empresa}</Badge>}
        </div>
        {c.telefono && <p className="text-sm text-black/60">📞 {c.telefono}</p>}
        {c.correo && <p className="text-sm text-black/60">✉️ {c.correo}</p>}
        {c.profesion && <p className="text-sm text-black/60">💼 {c.profesion}</p>}

        <button
          type="button"
          onClick={() => guardarEnContactosDelCelular(c, agency)}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-100 px-3.5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          📇 Guardar en contactos de mi celular
        </button>

        {/* Acciones de contacto — solo aquí adentro, con el expediente ya confirmado */}
        <div className="rounded-xl border border-black/10 p-3">
          <p className="mb-2 text-xs font-medium text-black/45">Contactar a {c.nombre.split(" ")[0]}</p>
          <ContactoQuickButtons contacto={c} registrar={registrarContacto} />
        </div>

        {c.circulo && (
          <div className="rounded-xl bg-indigo-50 p-3.5">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-indigo-900">{CIRCULO_EMOJI[c.circulo]} {CIRCULO_LABEL[c.circulo]}</p>
              {c.cercania && <Badge className="bg-white text-indigo-700">Cercanía {c.cercania}</Badge>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-indigo-900/70">
              <p>Último contacto: {diasDesde(c.ultimoContacto) != null ? haceTiempo(c.ultimoContacto) : "—"}</p>
              <p>Potencial de referidos: {c.potencialReferidos || "—"}</p>
              {c.cumpleanos && <p>Cumpleaños: {formatCumple(c.cumpleanos)}</p>}
              {c.intereses && <p>Intereses: {c.intereses}</p>}
            </div>
          </div>
        )}

        {/* Historial de comentarios: el corazón del expediente */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Historial de comentarios ({notas.length})</h3>
          {notas.length === 0 ? (
            <p className="mb-2 text-sm text-black/40">Sin notas todavía. Registra lo que hablen para no perder el hilo la próxima vez.</p>
          ) : (
            <div className="mb-3 flex flex-col gap-2.5">
              {notas.map((n) => (
                <div key={n.id} className="rounded-xl bg-gray-100 p-3">
                  <p className="text-sm text-gray-800">{n.texto}</p>
                  <p className="mt-1 text-[11px] text-black/40">{haceTiempo(n.fecha)}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Agregar una nota de esta conversación…"
              value={notaNueva}
              onChange={(e) => setNotaNueva(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && guardarNota()}
            />
            <Button variant="secondary" onClick={guardarNota} disabled={!notaNueva.trim()}>
              Agregar
            </Button>
          </div>
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Oportunidades ({ops.length})</h3>
          {ops.length === 0 ? (
            <p className="text-sm text-black/40">Sin oportunidades registradas.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {ops.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-gray-100 px-3 py-2 text-sm">
                  <span className="capitalize text-gray-900">{TIPO_OP_LABEL[o.tipo]} · {ETAPA_LABEL[o.etapa]}</span>
                  <Badge className={o.estado === "activa" ? "bg-brand-100 text-brand-700" : "bg-black/5 text-black/60"}>{o.estado}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Actividad</h3>
          {acts.length === 0 ? (
            <p className="text-sm text-black/40">Sin actividad registrada.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {acts.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">{a.titulo}</span>
                  <Badge className="bg-black/5 text-black/60">{a.estado}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
