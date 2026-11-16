import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Modal, Badge, Button, inputClass } from "../../components/ui/index.js";
import { TONE_BY_CLASIFICACION, CLASIFICACION_LABEL, CIRCULO_LABEL, CIRCULO_EMOJI } from "../../constants/contactos.js";
import { TIPO_OP_LABEL, ETAPA_LABEL } from "../../constants/oportunidades.js";
import { diasDesde, haceTiempo, formatCumple } from "../../lib/dates.js";
import { guardarEnContactosDelCelular } from "../../lib/contacts.js";
import { ContactoQuickButtons } from "../../components/shared/ContactoQuickButtons.jsx";
import { CrearContactoModal } from "./CrearContactoModal.jsx";
import { ESTADOS_GESTION, ESTADO_GESTION_LABEL, OBJETIVOS, OBJETIVO_LABEL, RESULTADO_LABEL } from "../../constants/gestion.js";

export function DetalleContactoModal() {
  const { expedienteId: id, contactos, oportunidades, actividades, interacciones, cerrarExpediente, registrarContacto, agregarNota, actualizarContacto, abrirLlamar, agency } = useAppData();
  const [notaNueva, setNotaNueva] = useState("");
  const [editando, setEditando] = useState(false);
  const c = contactos.find((x) => x.id === id);

  if (!id || !c) return null;
  const ops = oportunidades.filter((o) => o.contactoId === id);
  const acts = actividades.filter((a) => a.contactoId === id);
  const notas = c.notas || [];
  const llamadas = interacciones.filter((i) => i.contactoId === id).slice(0, 10);
  const objetivos = c.objetivos || [];
  const alternarObjetivo = (o) => actualizarContacto(c.id, { objetivos: objetivos.includes(o) ? objetivos.filter((x) => x !== o) : [...objetivos, o] });

  function guardarNota() {
    if (!notaNueva.trim()) return;
    agregarNota(c.id, notaNueva.trim());
    setNotaNueva("");
  }

  return (
    <Modal open onClose={cerrarExpediente} title={c.nombre}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Badge className={TONE_BY_CLASIFICACION[c.clasificacion]}>{CLASIFICACION_LABEL[c.clasificacion]}</Badge>
            {c.valorEstrategico === "vip" && <Badge className="bg-gold-100 text-gold-700">⭐ VIP</Badge>}
            {c.ciudad && <Badge>{c.ciudad}</Badge>}
            {c.empresa && <Badge>{c.empresa}</Badge>}
          </div>
          <button onClick={() => setEditando(true)} className="shrink-0 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200">
            ✏️ Editar
          </button>
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

        {/* Prospección: todo con un toque */}
        <div className="rounded-2xl border border-brand-700/20 bg-brand-50/40 p-3.5">
          {c.telefono && (
            <button onClick={() => abrirLlamar(c.id)} className="mb-3 flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-brand-700 text-base font-semibold text-white">
              📞 Llamar y registrar resultado
            </button>
          )}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/45">Estado de gestión</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {ESTADOS_GESTION.map((e) => (
              <button
                key={e}
                onClick={() => actualizarContacto(c.id, { estadoGestion: e })}
                className={`min-h-[40px] rounded-full px-3 text-xs font-semibold ${c.estadoGestion === e ? "bg-brand-700 text-white" : "border border-black/10 bg-white text-black/60"}`}
              >
                {ESTADO_GESTION_LABEL[e]}
              </button>
            ))}
          </div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/45">Qué quiere hacer</p>
          <div className="grid grid-cols-2 gap-1.5">
            {OBJETIVOS.map((o) => (
              <button
                key={o}
                onClick={() => alternarObjetivo(o)}
                className={`min-h-[44px] rounded-xl border-2 text-sm font-semibold ${objetivos.includes(o) ? "border-brand-700 bg-brand-50 text-brand-800" : "border-gray-200 bg-white text-gray-700"}`}
              >
                {OBJETIVO_LABEL[o]}
              </button>
            ))}
          </div>
          {llamadas.length > 0 && (
            <>
              <p className="mb-1.5 mt-3 text-xs font-semibold uppercase tracking-wide text-black/45">Últimas llamadas</p>
              <div className="flex flex-col gap-1">
                {llamadas.map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-2 text-sm">
                    <span className="truncate text-gray-800">{i.canal === "whatsapp" ? "💬" : "📞"} {i.resultado === "otro" ? i.resultadoTexto : RESULTADO_LABEL[i.resultado]}{i.cita ? " · cita" : ""}</span>
                    <span className="shrink-0 text-xs text-black/40">{haceTiempo(i.creadoEn)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

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

      <CrearContactoModal open={editando} onClose={() => setEditando(false)} contactoEditar={c} onGuardarEdicion={actualizarContacto} />
    </Modal>
  );
}
