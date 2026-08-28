import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, Button, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { ESTADO_KYC_LABEL, ESTADO_KYC_TONE, NIVEL_RIESGO_LABEL, NIVEL_RIESGO_TONE } from "../../constants/kyc.js";
import { CrearKycModal } from "./CrearKycModal.jsx";
import { DetalleKycModal } from "./DetalleKycModal.jsx";

// Nivel_riesgo puede venir null en registros viejos o recién creados sin recalcular —
// se trata como "bajo" solo para ordenar, nunca se le miente al usuario sobre el dato.
const ORDEN_RIESGO = { alto: 0, medio: 1, bajo: 2 };

export function Kyc() {
  const { contactos, contactoNombre, kyc, crearKyc, actualizarKyc, verificarListasKyc } = useAppData();
  const [crearAbierto, setCrearAbierto] = useState(false);
  const [detalleId, setDetalleId] = useState(null);

  const ordenados = [...kyc].sort((a, b) => (ORDEN_RIESGO[a.nivelRiesgo] ?? 3) - (ORDEN_RIESGO[b.nivelRiesgo] ?? 3));
  const pendientesAltoRiesgo = kyc.filter((k) => k.nivelRiesgo === "alto" && k.estado === "pendiente").length;

  return (
    <div>
      <SectionHeader
        title="Cumplimiento"
        subtitle={`${kyc.length} expediente(s) KYC`}
        action={<Button onClick={() => setCrearAbierto(true)}><Icon.Plus className="h-4 w-4" />Nuevo</Button>}
      />

      {pendientesAltoRiesgo > 0 && (
        <Card className="mb-6 border-l-4 border-l-rose-600 !bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-700">{pendientesAltoRiesgo} expediente(s) de riesgo alto sin revisar</p>
          <p className="mt-0.5 text-xs text-black/55">Revisalos antes de avanzar con la operación.</p>
        </Card>
      )}

      {kyc.length === 0 ? (
        <EmptyState title="Sin expedientes KYC" hint="Registrá la verificación de identidad de un comprador o vendedor antes de avanzar con una operación de monto alto o en efectivo." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {ordenados.map((k) => (
            <Card key={k.id} className="cursor-pointer p-3.5 hover:border-black/15">
              <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setDetalleId(k.id)}>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{contactoNombre(k.contactoId)}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge className={ESTADO_KYC_TONE[k.estado]}>{ESTADO_KYC_LABEL[k.estado]}</Badge>
                    {k.coincidenciaListas && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600">
                        <Icon.Bell className="h-3 w-3" />En lista
                      </span>
                    )}
                  </div>
                </div>
                <Badge className={NIVEL_RIESGO_TONE[k.nivelRiesgo]}>{NIVEL_RIESGO_LABEL[k.nivelRiesgo]}</Badge>
              </button>
            </Card>
          ))}
        </div>
      )}

      <CrearKycModal open={crearAbierto} onClose={() => setCrearAbierto(false)} contactos={contactos} onCrear={crearKyc} />
      <DetalleKycModal
        id={detalleId} registros={kyc} contactoNombre={contactoNombre}
        onClose={() => setDetalleId(null)} onActualizar={actualizarKyc} onVerificarListas={verificarListasKyc}
      />
    </div>
  );
}
