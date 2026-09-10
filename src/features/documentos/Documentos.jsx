import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { TIPO_OP_LABEL } from "../../constants/oportunidades.js";

// El "mundo" documental del asesor: una tarjeta por oportunidad, con cuántos documentos
// del checklist ya están subidos/aprobados. El detalle (checklist + archivos) vive en
// DetalleDocumentosModal, abierto desde acá o desde la propia oportunidad.
export function Documentos() {
  const { oportunidades, documentos, contactoNombre, abrirDocumentos } = useAppData();

  const activas = oportunidades.filter((o) => o.estado === "activa");

  function progreso(oportunidadId) {
    const items = documentos.filter((d) => d.oportunidadId === oportunidadId);
    const listos = items.filter((d) => d.estado === "subido" || d.estado === "aprobado").length;
    return { total: items.length, listos };
  }

  return (
    <div>
      <SectionHeader title="Documentos" subtitle={`Expediente documental de ${activas.length} oportunidad(es) activa(s)`} />

      {activas.length === 0 ? (
        <EmptyState title="Sin oportunidades activas" hint="El expediente de documentos se arma dentro de cada oportunidad — crea una desde Contactos u Oportunidades para empezar." />
      ) : (
        <div className="flex flex-col gap-2.5">
          {activas.map((o) => {
            const { total, listos } = progreso(o.id);
            const completo = total > 0 && listos === total;
            return (
              <Card key={o.id} className="p-3.5">
                <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => abrirDocumentos(o.id)}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{contactoNombre(o.contactoId)}</p>
                    <p className="text-xs text-black/50">{TIPO_OP_LABEL[o.tipo]}{o.zona ? ` · ${o.zona}` : ""}</p>
                  </div>
                  <Badge className={total === 0 ? "bg-gray-100 text-gray-600" : completo ? "bg-brand-100 text-brand-700" : "bg-gold-100 text-gold-700"}>
                    {total === 0 ? "Sin iniciar" : `${listos}/${total} documentos`}
                  </Badge>
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
