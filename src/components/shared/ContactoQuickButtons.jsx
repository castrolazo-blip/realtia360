import { Icon } from "../icons/Icon.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";
import { telHref, waHref, mailHref } from "../../lib/contacts.js";

// Usado desde el expediente de contacto y desde los modales de actividad —
// vive fuera de cualquier feature porque ambos lo necesitan.
export function ContactoQuickButtons({ contacto, registrar }) {
  const { agency } = useAppData();
  if (!contacto) return null;
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={!contacto.telefono}
        onClick={() => {
          window.open(telHref(contacto.telefono), "_blank");
          registrar(contacto.id, "llamada", `Llamar a ${contacto.nombre}`);
        }}
        className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-brand-50 py-2.5 text-brand-700 disabled:opacity-30"
      >
        <Icon.Phone className="h-[1.125rem] w-[1.125rem]" />
        <span className="text-[11px] font-medium">Llamar</span>
      </button>
      <button
        type="button"
        disabled={!contacto.telefono}
        onClick={() => {
          window.open(waHref(contacto.telefono, `Hola ${contacto.nombre.split(" ")[0]}, te escribe ${agency.nombreAgente} de ${agency.nombreOficina}.`), "_blank");
          registrar(contacto.id, "llamada", `Enviar WhatsApp a ${contacto.nombre}`);
        }}
        className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-brand-50 py-2.5 text-brand-700 disabled:opacity-30"
      >
        <Icon.Whatsapp className="h-[1.125rem] w-[1.125rem]" />
        <span className="text-[11px] font-medium">WhatsApp</span>
      </button>
      <button
        type="button"
        disabled={!contacto.correo}
        onClick={() => {
          window.open(mailHref(contacto.correo, `${agency.nombreOficina} — seguimiento`), "_blank");
          registrar(contacto.id, "documento", `Enviar correo a ${contacto.nombre}`);
        }}
        className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-sky-50 py-2.5 text-sky-700 disabled:opacity-30"
      >
        <Icon.Mail className="h-[1.125rem] w-[1.125rem]" />
        <span className="text-[11px] font-medium">Correo</span>
      </button>
    </div>
  );
}
