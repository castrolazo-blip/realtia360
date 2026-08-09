import { Card, Badge, Button } from "../ui/index.js";
import { Icon, TIPO_ICON } from "../icons/Icon.jsx";
import { formatHora } from "../../lib/dates.js";

// Usado desde Inicio y desde Agenda — una actividad pendiente/vencida/completada.
export function ActividadCard({ a, contactoNombre, urgente, onAbrir, onReprogramar }) {
  const TipoIcon = TIPO_ICON[a.tipo] || Icon.Check;
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${urgente ? "bg-rose-50 text-rose-600" : "bg-brand-50 text-brand-700"}`}>
          <TipoIcon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-gray-900">{a.titulo}</p>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-xs text-black/45">
            <span>{contactoNombre(a.contactoId)}</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1">
              <Icon.Clock className="h-3 w-3" />
              {formatHora(a.fechaHora)}
            </span>
          </div>
          {urgente && <Badge className="mt-2 bg-rose-100 text-rose-700">Vencida</Badge>}
          {a.estado === "completada" && <Badge className="mt-2 bg-brand-100 text-brand-700">Completada</Badge>}
          {a.estado === "cancelada" && <Badge className="mt-2 bg-gray-100 text-gray-500">Cancelada</Badge>}
        </div>
      </div>
      {a.estado === "pendiente" && (
        <div className="mt-3 flex gap-2">
          <Button variant="secondary" className="flex-1 !py-2 text-xs" onClick={onReprogramar}>
            Reprogramar
          </Button>
          <Button variant="primary" className="flex-1 !py-2 text-xs" onClick={onAbrir}>
            Completar
          </Button>
        </div>
      )}
    </Card>
  );
}
