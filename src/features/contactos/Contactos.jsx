import { useEffect, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, Button, Chip, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { CLASIFICACIONES, CLASIFICACION_LABEL, TONE_BY_CLASIFICACION, CIRCULOS, CIRCULO_LABEL, CIRCULO_EMOJI } from "../../constants/contactos.js";
import { CrearContactoModal } from "./CrearContactoModal.jsx";
import { ESTADO_GESTION_LABEL, ESTADO_GESTION_TONE } from "../../constants/gestion.js";
import { enCiclo, esProspecto, esComprador } from "../llamar/gestion.js";

// Filtros de gestión (prospección). "busqueda" = etapa 1 del círculo virtuoso.
const FILTROS_GESTION = [
  ["busqueda", "1. Búsqueda"],
  ["prospectos", "Prospectos (venden)"],
  ["compradores", "Compradores"],
  ["sin_gestion", "Sin gestión"],
  ["seguimiento", "En seguimiento"],
  ["con_proxima", "Con próxima acción"],
  ["futuro", "Futuro"],
  ["no_interesado", "No interesados"],
  ["no_contactar", "No contactar"],
];

export function Contactos() {
  const { contactos, actividades, requerimientos, crearContacto, abrirExpediente, filtroContactos, setFiltroContactos, setImportarAbierto } = useAppData();
  const [q, setQ] = useState("");
  const [modo, setModo] = useState(filtroContactos ? "gestion" : "clasificacion"); // 'gestion' | 'clasificacion' | 'circulo'
  const [filtro, setFiltro] = useState(filtroContactos || "");
  const [crearAbierto, setCrearAbierto] = useState(false);

  // El filtro que manda el círculo virtuoso se usa una sola vez al entrar.
  useEffect(() => {
    if (filtroContactos) setFiltroContactos("");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const conPendiente = new Set(actividades.filter((a) => a.estado === "pendiente").map((a) => a.contactoId));
  const conRequerimiento = new Set(requerimientos.filter((r) => r.estado === "activo").map((r) => r.contactoId));
  function pasaFiltroGestion(c) {
    switch (filtro) {
      case "busqueda": return enCiclo(c) && (esProspecto(c) || esComprador(c) || conRequerimiento.has(c.id));
      case "prospectos": return enCiclo(c) && esProspecto(c);
      case "compradores": return enCiclo(c) && (esComprador(c) || conRequerimiento.has(c.id));
      case "sin_gestion": return !c.ultimaGestion && enCiclo(c);
      case "con_proxima": return conPendiente.has(c.id);
      case "": return true;
      default: return c.estadoGestion === filtro;
    }
  }

  function cambiarModo(m) {
    setModo(m);
    setFiltro("");
  }

  const filtrados = contactos.filter((c) => {
    if (modo === "clasificacion" && filtro && c.clasificacion !== filtro) return false;
    if (modo === "circulo" && filtro && c.circulo !== filtro) return false;
    if (modo === "gestion" && !pasaFiltroGestion(c)) return false;
    const digitos = q.replace(/\D/g, "");
    if (q && !c.nombre.toLowerCase().includes(q.toLowerCase()) && !(c.empresa || "").toLowerCase().includes(q.toLowerCase())
      && !(digitos.length >= 3 && (c.telefono || "").replace(/\D/g, "").includes(digitos))) return false;
    return true;
  });

  const conteoPorCirculo = CIRCULOS.reduce((acc, key) => {
    acc[key] = contactos.filter((c) => c.circulo === key).length;
    return acc;
  }, {});

  return (
    <div>
      <SectionHeader title="Contactos" subtitle={`${contactos.length} en tu cartera`} action={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setImportarAbierto(true)}>Importar</Button>
          <Button onClick={() => setCrearAbierto(true)}><Icon.Plus className="h-4 w-4" />Nuevo</Button>
        </div>
      } />

      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3.5 py-2.5">
        <Icon.Search className="h-4 w-4 text-black/35" />
        <input placeholder="Buscar por nombre, empresa o teléfono…" className="flex-1 bg-transparent text-base outline-none" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        <Chip activo={modo === "gestion"} onClick={() => cambiarModo("gestion")}>📞 Gestión</Chip>
        <Chip activo={modo === "clasificacion"} onClick={() => cambiarModo("clasificacion")}>Clasificación CRM</Chip>
        <Chip activo={modo === "circulo"} onClick={() => cambiarModo("circulo")}>🎯 Círculo de Influencia</Chip>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <Chip activo={filtro === ""} onClick={() => setFiltro("")}>Todos</Chip>
        {modo === "gestion"
          ? FILTROS_GESTION.map(([k, l]) => <Chip key={k} activo={filtro === k} onClick={() => setFiltro(k)}>{l}</Chip>)
          : modo === "clasificacion"
          ? CLASIFICACIONES.map((c) => <Chip key={c} activo={filtro === c} onClick={() => setFiltro(c)}>{CLASIFICACION_LABEL[c]}</Chip>)
          : CIRCULOS.map((c) => (
              <Chip key={c} activo={filtro === c} onClick={() => setFiltro(c)}>
                {CIRCULO_EMOJI[c]} {CIRCULO_LABEL[c]} {conteoPorCirculo[c] > 0 && `(${conteoPorCirculo[c]})`}
              </Chip>
            ))}
      </div>

      {filtrados.length === 0 ? (
        <EmptyState title="Sin contactos" hint="Crea el primero para empezar a construir tu cartera de relaciones." />
      ) : (
        <div className="flex flex-col gap-2.5 lg:grid lg:grid-cols-2 lg:gap-3 xl:grid-cols-3">
          {filtrados.map((c) => (
            <Card key={c.id} className="p-4">
              <button className="flex w-full items-center justify-between gap-3 text-left" onClick={() => abrirExpediente(c.id)}>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-semibold text-gray-900">{c.nombre}</p>
                      {c.valorEstrategico === "vip" && <Badge className="bg-gold-100 text-gold-700">VIP</Badge>}
                    </div>
                    <p className="truncate text-xs text-black/45">{c.empresa || c.ciudad || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {modo === "gestion" ? (
                    <Badge className={ESTADO_GESTION_TONE[c.estadoGestion]}>{ESTADO_GESTION_LABEL[c.estadoGestion]}</Badge>
                  ) : modo === "clasificacion" ? (
                    <Badge className={TONE_BY_CLASIFICACION[c.clasificacion]}>{CLASIFICACION_LABEL[c.clasificacion]}</Badge>
                  ) : c.circulo ? (
                    <Badge className="bg-indigo-50 text-indigo-700">
                      {CIRCULO_EMOJI[c.circulo]} {CIRCULO_LABEL[c.circulo]}
                    </Badge>
                  ) : (
                    <Badge>Sin asignar</Badge>
                  )}
                  <Icon.Chevron className="h-4 w-4 shrink-0 text-black/25" />
                </div>
              </button>
            </Card>
          ))}
        </div>
      )}

      <CrearContactoModal open={crearAbierto} onClose={() => setCrearAbierto(false)} onCrear={(d) => { crearContacto(d); setCrearAbierto(false); }} />
    </div>
  );
}
