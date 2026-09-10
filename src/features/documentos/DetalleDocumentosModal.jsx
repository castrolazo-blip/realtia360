import { useEffect, useRef, useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";
import { Modal, Badge, Button, inputClass } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { TIPO_DOCUMENTO_LABEL, ESTADO_DOCUMENTO_LABEL, ESTADO_DOCUMENTO_TONE } from "../../constants/documentos.js";
import { TIPO_OP_LABEL } from "../../constants/oportunidades.js";

function FilaDocumento({ doc, onSubir, onQuitarArchivo, onVer, onCambiarEstado, onEliminar }) {
  const inputRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [viendo, setViendo] = useState(false);

  async function manejarArchivo(e) {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;
    setSubiendo(true);
    await onSubir(archivo);
    setSubiendo(false);
  }

  async function verArchivo() {
    setViendo(true);
    await onVer();
    setViendo(false);
  }

  return (
    <div className="rounded-xl border border-black/10 p-3.5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{doc.tipo === "otro" ? doc.nombre : TIPO_DOCUMENTO_LABEL[doc.tipo]}</p>
          {doc.archivoNombre && <p className="truncate text-xs text-black/45">{doc.archivoNombre}</p>}
        </div>
        <Badge className={ESTADO_DOCUMENTO_TONE[doc.estado]}>{ESTADO_DOCUMENTO_LABEL[doc.estado]}</Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input ref={inputRef} type="file" className="hidden" onChange={manejarArchivo} />
        {doc.archivoPath ? (
          <>
            <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={verArchivo} disabled={viendo}>
              {viendo ? "Abriendo…" : "Ver archivo"}
            </Button>
            <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={() => inputRef.current?.click()} disabled={subiendo}>
              Reemplazar
            </Button>
            <Button variant="ghost" className="!px-3 !py-1.5 text-xs" onClick={onQuitarArchivo}>
              Quitar
            </Button>
          </>
        ) : (
          <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => inputRef.current?.click()} disabled={subiendo}>
            {subiendo ? "Subiendo…" : "Subir archivo"}
          </Button>
        )}
        {doc.estado === "subido" && (
          <>
            <button className="text-xs font-semibold text-brand-700" onClick={() => onCambiarEstado("aprobado")}>Marcar aprobado</button>
            <button className="text-xs font-semibold text-rose-600" onClick={() => onCambiarEstado("rechazado")}>Rechazar</button>
          </>
        )}
        {doc.estado === "rechazado" && doc.archivoPath && (
          <button className="text-xs font-semibold text-brand-700" onClick={() => onCambiarEstado("subido")}>Deshacer rechazo</button>
        )}
        {doc.tipo === "otro" && (
          <button className="ml-auto text-xs font-semibold text-rose-600" onClick={onEliminar}>Eliminar</button>
        )}
      </div>
    </div>
  );
}

export function DetalleDocumentosModal() {
  const {
    documentosOportunidadId: id, oportunidades, documentos, contactoNombre, cerrarDocumentos,
    asegurarChecklistDocumentos, agregarDocumentoPersonalizado, eliminarDocumento,
    subirDocumento, quitarArchivoDocumento, actualizarEstadoDocumento, urlDescargaDocumento,
  } = useAppData();
  const [nombreNuevo, setNombreNuevo] = useState("");
  const [cargandoChecklist, setCargandoChecklist] = useState(false);

  const o = oportunidades.find((x) => x.id === id);
  const items = documentos.filter((d) => d.oportunidadId === id);

  useEffect(() => {
    if (!id || !o) return;
    if (items.length > 0) return;
    setCargandoChecklist(true);
    asegurarChecklistDocumentos(id).finally(() => setCargandoChecklist(false));
    // Solo se dispara al abrir un expediente sin documentos — no depende de `items`
    // para no reintentar en cada render mientras la inserción está en curso.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!id || !o) return null;

  async function verArchivo(docId) {
    const url = await urlDescargaDocumento(docId);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  function agregarPersonalizado() {
    if (!nombreNuevo.trim()) return;
    agregarDocumentoPersonalizado(id, nombreNuevo.trim());
    setNombreNuevo("");
  }

  return (
    <Modal open onClose={cerrarDocumentos} title="Documentos">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-brand-50 text-brand-700">{TIPO_OP_LABEL[o.tipo]}</Badge>
          <p className="text-sm font-semibold text-gray-900">{contactoNombre(o.contactoId)}</p>
        </div>

        {cargandoChecklist ? (
          <p className="text-sm text-black/45">Preparando el checklist…</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-black/45">Sin documentos todavía.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {items.map((doc) => (
              <FilaDocumento
                key={doc.id}
                doc={doc}
                onSubir={(archivo) => subirDocumento(doc.id, archivo)}
                onQuitarArchivo={() => quitarArchivoDocumento(doc.id)}
                onVer={() => verArchivo(doc.id)}
                onCambiarEstado={(estado) => actualizarEstadoDocumento(doc.id, estado)}
                onEliminar={() => eliminarDocumento(doc.id)}
              />
            ))}
          </div>
        )}

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/40">Agregar otro documento</h3>
          <div className="flex gap-2">
            <input
              className={inputClass}
              placeholder="Ej. Poder notarial, constancia laboral…"
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && agregarPersonalizado()}
            />
            <Button variant="secondary" onClick={agregarPersonalizado} disabled={!nombreNuevo.trim()}>
              <Icon.Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button onClick={cerrarDocumentos} className="w-full !py-3">Cerrar</Button>
      </div>
    </Modal>
  );
}
