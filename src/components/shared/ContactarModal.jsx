import { useState } from "react";
import { Modal as ModalBase } from "../ui/Modal.jsx";
import { Icon } from "../icons/Icon.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";
import { telHref, waHref, mailHref } from "../../lib/contacts.js";

// Modal de acceso rápido "Llamar a…" / "WhatsApp a…" / "Correo a…", disparado desde las
// acciones rápidas de Inicio. Vive fuera de ese módulo porque se monta a nivel de la app.
export function ContactarModal({ tipo, contactos, onClose, onRegistrar }) {
  const { agency } = useAppData();
  const [q, setQ] = useState("");
  if (!tipo) return null;

  const meta = {
    llamar: {
      titulo: "Llamar a…", icon: Icon.Phone, actividadTipo: "llamada",
      accion: (c) => telHref(c.telefono), etiqueta: (c) => c.telefono || "Sin teléfono", disabled: (c) => !c.telefono,
    },
    whatsapp: {
      titulo: "Enviar WhatsApp a…", icon: Icon.Whatsapp, actividadTipo: "llamada",
      accion: (c) => waHref(c.telefono, `Hola ${c.nombre.split(" ")[0]}, te escribe ${agency.nombreAgente} de ${agency.nombreOficina}.`),
      etiqueta: (c) => c.telefono || "Sin teléfono", disabled: (c) => !c.telefono,
    },
    email: {
      titulo: "Enviar correo a…", icon: Icon.Mail, actividadTipo: "documento",
      accion: (c) => mailHref(c.correo, `${agency.nombreOficina} — seguimiento`),
      etiqueta: (c) => c.correo || "Sin correo", disabled: (c) => !c.correo,
    },
  }[tipo];

  const filtrados = contactos.filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()));

  function elegir(c) {
    if (meta.disabled(c)) return;
    window.open(meta.accion(c), "_blank");
    onRegistrar(c.id, meta.actividadTipo, `${meta.titulo.replace("a…", "a")} ${c.nombre}`);
    onClose();
  }

  return (
    <ModalBase open onClose={onClose} title={meta.titulo}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5">
          <Icon.Search className="h-4 w-4 text-black/35" />
          <input autoFocus placeholder="Buscar contacto…" className="flex-1 bg-transparent text-sm outline-none" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex max-h-80 flex-col gap-1.5 overflow-y-auto">
          {filtrados.map((c) => (
            <button
              key={c.id}
              onClick={() => elegir(c)}
              disabled={meta.disabled(c)}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-brand-50 disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">
                  {c.nombre.charAt(0).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{c.nombre}</p>
                  <p className="truncate text-xs text-black/45">{meta.etiqueta(c)}</p>
                </div>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white">
                <meta.icon className="h-4 w-4" />
              </span>
            </button>
          ))}
          {filtrados.length === 0 && <p className="px-3 py-6 text-center text-sm text-black/40">Sin resultados.</p>}
        </div>
      </div>
    </ModalBase>
  );
}
