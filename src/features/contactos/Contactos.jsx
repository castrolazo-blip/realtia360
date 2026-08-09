import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Card, Badge, Button, Chip, EmptyState, SectionHeader } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { CLASIFICACIONES, CLASIFICACION_LABEL, TONE_BY_CLASIFICACION, CIRCULOS, CIRCULO_LABEL, CIRCULO_EMOJI } from "../../constants/contactos.js";
import { CrearContactoModal } from "./CrearContactoModal.jsx";

export function Contactos() {
  const { contactos, crearContacto, abrirExpediente } = useAppData();
  const [q, setQ] = useState("");
  const [modo, setModo] = useState("clasificacion"); // 'clasificacion' | 'circulo'
  const [filtro, setFiltro] = useState("");
  const [crearAbierto, setCrearAbierto] = useState(false);

  function cambiarModo(m) {
    setModo(m);
    setFiltro("");
  }

  const filtrados = contactos.filter((c) => {
    if (modo === "clasificacion" && filtro && c.clasificacion !== filtro) return false;
    if (modo === "circulo" && filtro && c.circulo !== filtro) return false;
    if (q && !c.nombre.toLowerCase().includes(q.toLowerCase()) && !(c.empresa || "").toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const conteoPorCirculo = CIRCULOS.reduce((acc, key) => {
    acc[key] = contactos.filter((c) => c.circulo === key).length;
    return acc;
  }, {});

  return (
    <div>
      <SectionHeader title="Contactos" subtitle={`${contactos.length} en tu cartera`} action={<Button onClick={() => setCrearAbierto(true)}><Icon.Plus className="h-4 w-4" />Nuevo</Button>} />

      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-black/10 bg-white px-3.5 py-2.5">
        <Icon.Search className="h-4 w-4 text-black/35" />
        <input placeholder="Buscar por nombre o empresa…" className="flex-1 bg-transparent text-base outline-none" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="mb-4 flex gap-1.5">
        <Chip activo={modo === "clasificacion"} onClick={() => cambiarModo("clasificacion")}>Clasificación CRM</Chip>
        <Chip activo={modo === "circulo"} onClick={() => cambiarModo("circulo")}>🎯 Círculo de Influencia</Chip>
      </div>

      <div className="mb-5 flex flex-wrap gap-1.5">
        <Chip activo={filtro === ""} onClick={() => setFiltro("")}>Todos</Chip>
        {modo === "clasificacion"
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
                  {modo === "clasificacion" ? (
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
