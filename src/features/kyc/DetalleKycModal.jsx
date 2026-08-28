import { useState } from "react";
import { Modal, Field, Badge, Button, OpcionesBotones } from "../../components/ui/index.js";
import {
  TIPO_DOCUMENTO_LABEL, ORIGEN_FONDOS_LABEL, FORMA_PAGO_LABEL,
  ESTADOS_KYC, ESTADO_KYC_LABEL, NIVEL_RIESGO_LABEL, NIVEL_RIESGO_TONE,
} from "../../constants/kyc.js";
import { formatMoney } from "../../lib/format.js";
import { haceTiempo } from "../../lib/dates.js";
import { calcularRiesgo } from "./riesgo.js";

export function DetalleKycModal({ id, registros, contactoNombre, onClose, onActualizar, onVerificarListas }) {
  const [verificando, setVerificando] = useState(false);
  const [error, setError] = useState("");
  const k = registros.find((x) => x.id === id);
  if (!id || !k) return null;
  const { factores } = calcularRiesgo(k);

  async function verificar() {
    setVerificando(true);
    setError("");
    const res = await onVerificarListas(k.id);
    setVerificando(false);
    if (res && res.ok === false) setError(res.error);
  }

  async function cambiarEstado(estado) {
    const res = await onActualizar(k.id, { estado });
    if (res && res.ok === false) setError(res.error);
  }

  return (
    <Modal open onClose={onClose} title={contactoNombre(k.contactoId)}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={NIVEL_RIESGO_TONE[k.nivelRiesgo]}>{NIVEL_RIESGO_LABEL[k.nivelRiesgo]} · {k.puntajeRiesgo} pts</Badge>
          {k.coincidenciaListas && <Badge className="bg-rose-100 text-rose-700">⚠️ Coincidencia en lista de sanciones</Badge>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Documento</p>
            <p className="text-sm font-semibold text-gray-900">{TIPO_DOCUMENTO_LABEL[k.tipoDocumento] || "—"} {k.numeroDocumento || ""}</p>
          </div>
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Monto de transacción</p>
            <p className="text-sm font-semibold text-gray-900">{formatMoney(k.montoTransaccion)}</p>
          </div>
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Origen de fondos</p>
            <p className="text-sm font-semibold text-gray-900">{ORIGEN_FONDOS_LABEL[k.origenFondos] || "No declarado"}</p>
          </div>
          <div className="rounded-xl bg-gray-100 p-3">
            <p className="text-xs text-black/45">Forma de pago</p>
            <p className="text-sm font-semibold text-gray-900">{FORMA_PAGO_LABEL[k.formaPago] || "—"}</p>
          </div>
        </div>

        <Field label="Estado del expediente">
          <OpcionesBotones
            columnas={2}
            opciones={ESTADOS_KYC.map((e) => ({ value: e, label: ESTADO_KYC_LABEL[e] }))}
            valor={k.estado}
            onChange={cambiarEstado}
          />
        </Field>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-black/40">Verificación en listas de sanciones (OFAC)</h3>
            <Button variant="secondary" onClick={verificar} disabled={verificando} className="!px-3 !py-1.5 text-xs">
              {verificando ? "Consultando…" : k.verificadoEn ? "Volver a verificar" : "Verificar ahora"}
            </Button>
          </div>
          {k.verificadoEn ? (
            <>
              <p className="mb-2 text-xs text-black/45">Última verificación: {haceTiempo(k.verificadoEn)}</p>
              {k.coincidenciaListas ? (
                <div className="flex flex-col gap-1.5">
                  {(k.detalleListas || []).map((r, i) => (
                    <div key={i} className="rounded-xl bg-rose-50 p-3 text-sm text-rose-900">
                      <p className="font-semibold">{r.nombre}</p>
                      <p className="text-xs text-rose-700">{r.programa} · {r.similitud}% de similitud</p>
                    </div>
                  ))}
                  <p className="text-xs text-black/40">Una coincidencia no confirma nada por sí sola — revisala con calma antes de decidir.</p>
                </div>
              ) : (
                <p className="rounded-xl bg-brand-50 p-3 text-sm text-brand-800">Sin coincidencias en la lista OFAC.</p>
              )}
            </>
          ) : (
            <p className="text-sm text-black/40">Todavía no se ha verificado contra listas de sanciones.</p>
          )}
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Factores de riesgo evaluados</h3>
          <div className="flex flex-col gap-1">
            {factores.map((f, i) => (
              <div key={i} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${f.cumple ? "bg-gold-50" : "bg-gray-50 text-black/35"}`}>
                <span>{f.etiqueta}</span>
                {f.cumple && <span className="text-xs font-semibold text-gold-700">+{f.puntos}</span>}
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-rose-600">⚠️ {error}</p>}
      </div>
    </Modal>
  );
}
