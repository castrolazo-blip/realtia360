import { useState } from "react";
import { useAppData } from "../../context/AppDataContext.jsx";

// Fotos de una captación, para el agente dueño: agregar desde la galería o la cámara del
// celular, elegir la portada y quitar. Todo con toques.
export function GestorFotos({ captacion }) {
  const { agregarFotos, quitarFoto, usarComoPortada } = useAppData();
  const [subiendo, setSubiendo] = useState(0);
  const [elegida, setElegida] = useState(null);
  const [aviso, setAviso] = useState("");
  const fotos = captacion.fotos || [];

  async function elegir(e) {
    const archivos = [...(e.target.files || [])];
    e.target.value = "";
    if (!archivos.length) return;
    setAviso("");
    setSubiendo(archivos.length);
    const res = await agregarFotos(captacion.id, archivos);
    setSubiendo(0);
    if (!res.ok) setAviso(res.error || "No se pudieron subir las fotos.");
    else if (res.subidas < res.total) setAviso(`Se subieron ${res.subidas} de ${res.total}. Intenta de nuevo con las demás.`);
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-black/40">Fotos ({fotos.length})</h3>
        {fotos.length > 0 && <span className="text-[11px] text-black/40">Toca una foto para elegir portada o quitarla</span>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {fotos.map((f, i) => (
          <button key={f.path} onClick={() => setElegida(elegida === f.path ? null : f.path)} className={`relative aspect-square overflow-hidden rounded-2xl ${elegida === f.path ? "ring-4 ring-ink-950" : ""}`}>
            <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink-950">Portada</span>}
          </button>
        ))}
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-black/15 bg-gray-50 text-center text-xs font-semibold text-black/55">
          <span className="text-2xl">{subiendo ? "⏳" : "＋"}</span>
          {subiendo ? `Subiendo ${subiendo}…` : "Agregar fotos"}
          <input type="file" accept="image/*" multiple className="hidden" onChange={elegir} disabled={!!subiendo} />
        </label>
      </div>
      {elegida && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button onClick={() => { usarComoPortada(captacion.id, elegida); setElegida(null); }} className="min-h-[48px] rounded-2xl bg-ink-950 text-sm font-semibold text-white">Usar como portada</button>
          <button onClick={() => { quitarFoto(captacion.id, elegida); setElegida(null); }} className="min-h-[48px] rounded-2xl border-2 border-rose-200 text-sm font-semibold text-rose-700">Quitar foto</button>
        </div>
      )}
      {aviso && <p className="mt-2 rounded-xl bg-rose-50 p-2.5 text-sm text-rose-700">{aviso}</p>}
    </div>
  );
}
