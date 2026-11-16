import { useState } from "react";
import { Modal, Button } from "../../components/ui/index.js";
import { useAppData } from "../../context/AppDataContext.jsx";
import { leerArchivoContactos } from "../../lib/importarContactos.js";
import { formatTelefono } from "../../lib/telefono.js";

// Importar contactos desde el teléfono (.vcf) o desde Excel/CSV. Nada se guarda hasta
// que el asesor confirma; los repetidos (mismo teléfono) se omiten solos.
export function ImportarContactosModal() {
  const { importarAbierto, setImportarAbierto, contactos, importarContactos, abrirLlamar } = useAppData();
  const [previa, setPrevia] = useState(null);
  const [error, setError] = useState("");
  const [estado, setEstado] = useState("listo"); // listo | leyendo | guardando | hecho
  const [creados, setCreados] = useState(0);

  function cerrar() {
    setImportarAbierto(false);
    setPrevia(null); setError(""); setEstado("listo"); setCreados(0);
  }

  async function elegir(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(""); setEstado("leyendo");
    try {
      setPrevia(await leerArchivoContactos(file, contactos));
      setEstado("listo");
    } catch (err) {
      console.error("leerArchivoContactos", err);
      setError("No se pudo leer el archivo. Prueba con CSV o .vcf.");
      setEstado("listo");
    }
  }

  async function confirmar() {
    setEstado("guardando");
    const res = await importarContactos(previa.nuevos);
    if (!res.ok) { setError("No se pudieron guardar todos. Revisa tu conexión."); setEstado("listo"); return; }
    setCreados(res.creados);
    setEstado("hecho");
  }

  return (
    <Modal open={importarAbierto} onClose={cerrar} title="Importar contactos">
      {estado === "hecho" ? (
        <div className="flex flex-col gap-4">
          <p className="rounded-2xl bg-brand-50 p-4 text-sm font-semibold text-brand-800">✓ {creados} contactos importados. Ya están en tu cola de Llamar.</p>
          <button onClick={() => { cerrar(); abrirLlamar(null); }} className="min-h-[56px] rounded-2xl bg-brand-700 text-base font-semibold text-white">Empezar a llamar</button>
          <button onClick={cerrar} className="min-h-[52px] rounded-2xl border-2 border-gray-200 text-sm font-semibold text-gray-700">Listo</button>
        </div>
      ) : !previa ? (
        <div className="flex flex-col gap-4">
          <label className="flex min-h-[72px] cursor-pointer items-center justify-center rounded-2xl bg-brand-700 px-4 text-center text-base font-semibold text-white">
            {estado === "leyendo" ? "Leyendo archivo…" : "📂 Elegir archivo"}
            <input type="file" accept=".csv,.txt,.xlsx,.xls,.vcf" className="hidden" onChange={elegir} />
          </label>
          <p className="text-center text-xs text-black/45">Excel (.xlsx), CSV o tarjetas de contacto del teléfono (.vcf)</p>
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <div className="rounded-2xl bg-gray-50 p-4 text-sm text-black/60">
            <p className="font-semibold text-gray-800">Desde tu teléfono</p>
            <p className="mt-1"><b>iPhone:</b> Contactos → selecciona → Compartir → guarda el .vcf.<br /><b>Android:</b> Contactos → Exportar → archivo .vcf.</p>
            <p className="mt-3 font-semibold text-gray-800">Desde Excel</p>
            <p className="mt-1">Una fila por contacto con columnas <b>Nombre</b> y <b>Teléfono</b>. Los números de 8 dígitos se guardan con +503.</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-black/50">{previa.archivo}</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Dato label="Nuevos" valor={previa.nuevos.length} destacado />
            <Dato label="Ya los tienes" valor={previa.repetidos} />
            <Dato label="Sin teléfono" valor={previa.sinTelefono} />
          </div>
          {previa.nuevos.length > 0 && (
            <div className="max-h-56 overflow-y-auto rounded-2xl bg-gray-50 p-3 text-sm">
              {previa.nuevos.slice(0, 30).map((c, i) => (
                <div key={i} className="flex justify-between gap-2 border-b border-black/5 py-1.5 last:border-0">
                  <span className="truncate text-gray-800">{c.nombre}</span>
                  <span className="shrink-0 text-black/45">{formatTelefono(c.telefono)}</span>
                </div>
              ))}
              {previa.nuevos.length > 30 && <p className="pt-2 text-xs text-black/45">y {previa.nuevos.length - 30} más…</p>}
            </div>
          )}
          <p className="rounded-xl bg-sky-50 p-3 text-sm text-sky-800">Quedarán como <b>Sin gestión</b> y entrarán a tu cola de Llamar. Los repetidos no se tocan.</p>
          {error && <p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <div className="grid grid-cols-[1fr_2fr] gap-2">
            <Button variant="secondary" className="min-h-[52px]" onClick={() => setPrevia(null)}>Otro archivo</Button>
            <Button className="min-h-[52px] text-base" disabled={!previa.nuevos.length || estado === "guardando"} onClick={confirmar}>
              {estado === "guardando" ? "Importando…" : `Importar ${previa.nuevos.length}`}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Dato({ label, valor, destacado }) {
  return (
    <div className={`rounded-2xl p-3 ${destacado ? "bg-brand-50" : "bg-gray-50"}`}>
      <p className="font-display text-2xl font-semibold text-ink-950">{valor}</p>
      <p className="text-[11px] text-black/45">{label}</p>
    </div>
  );
}
