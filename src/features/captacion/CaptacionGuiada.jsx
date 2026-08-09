import { useState } from "react";
import { Field } from "../../components/ui/index.js";
import { Icon } from "../../components/icons/Icon.jsx";
import { TIPO_INMUEBLE_LABEL, UNIDAD_TERRENO_LABEL, OPERACION_INMUEBLE_LABEL, nuevoChecklist } from "../../constants/captacion.js";
import { ESPACIOS_CATALOGO } from "../../constants/espacios.js";
import { DEC_PILARES } from "../../constants/decPilares.js";
import { formatMoney } from "../../lib/format.js";
import { BotonGrande } from "./wizard/BotonGrande.jsx";
import { TarjetaSeleccion } from "./wizard/TarjetaSeleccion.jsx";
import { ContadorGrande } from "./wizard/ContadorGrande.jsx";

// Total de pasos: 1 bienvenida/propietario + 4 pilares DEC + 1 datos de propiedad
// + 1 características de espacios + 1 checklist + 1 resumen
const TOTAL_PASOS_CAPTACION = 9;

const campoClass = "w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3.5 text-base outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15";

export function CaptacionGuiada({ open, onClose, contactos, onCrear }) {
  const [paso, setPaso] = useState(0);
  const [contactoId, setContactoId] = useState("");
  const [tipoInmueble, setTipoInmueble] = useState("casa");
  const [operacion, setOperacion] = useState("venta");
  const [direccion, setDireccion] = useState("");
  const [zona, setZona] = useState("");
  const [precio, setPrecio] = useState("");
  const [comisionPct, setComisionPct] = useState("5");
  const [areaTerreno, setAreaTerreno] = useState("");
  const [unidadTerreno, setUnidadTerreno] = useState("varas2");
  const [areaConstruccion, setAreaConstruccion] = useState("");
  const [antiguedad, setAntiguedad] = useState("");
  const [remodelada, setRemodelada] = useState(false);
  const [amueblada, setAmueblada] = useState(false);
  const [respuestas, setRespuestas] = useState({ cliente: {}, propiedad: {}, mercado: {}, comprador: {} });
  const [espacios, setEspacios] = useState({}); // { [espacioId]: { contadores, caracteristicas, unidades } }
  const [espacioAbierto, setEspacioAbierto] = useState(null);
  const [unidadAbierta, setUnidadAbierta] = useState(null); // { contadorId, index } dentro de un espacio con unidades
  const [checklist, setChecklist] = useState(nuevoChecklist());

  if (!open) return null;

  function responder(pilarId, preguntaId, texto) {
    setRespuestas((prev) => ({ ...prev, [pilarId]: { ...prev[pilarId], [preguntaId]: texto } }));
  }
  function toggleEspacio(espacioId) {
    setEspacios((prev) => {
      if (prev[espacioId]) {
        const { [espacioId]: _quitar, ...resto } = prev;
        return resto;
      }
      return { ...prev, [espacioId]: { contadores: {}, caracteristicas: {}, unidades: {} } };
    });
    if (!espacios[espacioId]) setEspacioAbierto(espacioId);
  }
  function actualizarContador(espacioId, contadorId, valor) {
    setEspacios((prev) => {
      const catalogo = ESPACIOS_CATALOGO.find((e) => e.id === espacioId);
      const actual = prev[espacioId];
      let unidades = actual.unidades;
      if (catalogo.caracteristicasPorUnidad) {
        const listaActual = actual.unidades[contadorId] || [];
        const nuevaLista = listaActual.slice(0, valor);
        while (nuevaLista.length < valor) nuevaLista.push({ caracteristicas: {} });
        unidades = { ...actual.unidades, [contadorId]: nuevaLista };
      }
      return { ...prev, [espacioId]: { ...actual, contadores: { ...actual.contadores, [contadorId]: valor }, unidades } };
    });
  }
  function actualizarCaracteristica(espacioId, caracteristicaId, valor) {
    setEspacios((prev) => ({
      ...prev,
      [espacioId]: { ...prev[espacioId], caracteristicas: { ...prev[espacioId].caracteristicas, [caracteristicaId]: valor } },
    }));
  }
  function actualizarCaracteristicaUnidad(espacioId, contadorId, index, caracteristicaId, valor) {
    setEspacios((prev) => {
      const actual = prev[espacioId];
      const lista = actual.unidades[contadorId].slice();
      lista[index] = { ...lista[index], caracteristicas: { ...lista[index].caracteristicas, [caracteristicaId]: valor } };
      return { ...prev, [espacioId]: { ...actual, unidades: { ...actual.unidades, [contadorId]: lista } } };
    });
  }
  function toggleItemChecklist(itemId) {
    setChecklist((prev) => prev.map((it) => (it.id === itemId ? { ...it, completado: !it.completado } : it)));
  }
  function reiniciarYCerrar() {
    setPaso(0); setContactoId(""); setDireccion(""); setZona(""); setPrecio(""); setComisionPct("5");
    setRespuestas({ cliente: {}, propiedad: {}, mercado: {}, comprador: {} }); setEspacios({}); setEspacioAbierto(null); setUnidadAbierta(null);
    setChecklist(nuevoChecklist());
    onClose();
  }
  function crear() {
    const diagnostico = DEC_PILARES.map((p) => ({
      pilar: p.id, titulo: p.titulo,
      respuestas: p.preguntas.map((q) => ({ pregunta: q.texto, respuesta: respuestas[p.id][q.id] || "" })).filter((r) => r.respuesta.trim()),
    }));
    const espaciosDetalle = Object.keys(espacios).map((id) => {
      const catalogo = ESPACIOS_CATALOGO.find((e) => e.id === id);
      const datos = espacios[id];
      const contadoresConValor = catalogo.contadores
        .map((ct) => {
          const valor = datos.contadores[ct.id] || 0;
          let unidades = null;
          if (catalogo.caracteristicasPorUnidad && valor > 0) {
            unidades = (datos.unidades[ct.id] || []).map((u, idx) => ({
              etiqueta: valor > 1 ? `${ct.nombre} ${idx + 1}` : ct.nombre,
              caracteristicas: catalogo.caracteristicas
                .map((c) => ({ nombre: c.nombre, tipo: c.tipo, valor: u.caracteristicas[c.id] }))
                .filter((c) => c.valor === true || (typeof c.valor === "string" && c.valor.trim())),
            }));
          }
          return { nombre: ct.nombre, valor, unidades };
        })
        .filter((ct) => ct.valor > 0);
      return {
        id, nombre: catalogo.nombre, icono: catalogo.icono,
        cantidad: contadoresConValor.length > 0 ? contadoresConValor.reduce((n, ct) => n + ct.valor, 0) : null,
        contadores: contadoresConValor,
        caracteristicas: catalogo.caracteristicasPorUnidad
          ? []
          : catalogo.caracteristicas.map((c) => ({ nombre: c.nombre, tipo: c.tipo, valor: datos.caracteristicas[c.id] })).filter((c) => c.valor === true || (typeof c.valor === "string" && c.valor.trim())),
      };
    });
    onCrear({
      contactoId, tipoInmueble, operacion, direccion, zona, precio: precio ? Number(precio) : null, comisionPct: Number(comisionPct) || 0,
      areaTerreno: areaTerreno ? Number(areaTerreno) : null, areaConstruccion: areaConstruccion ? Number(areaConstruccion) : null,
      antiguedad: antiguedad ? Number(antiguedad) : null, remodelada, amueblada, unidadTerreno,
      notas: "", checklist, diagnostico, espacios: espaciosDetalle,
    });
    reiniciarYCerrar();
  }

  const esUltimoPaso = paso === TOTAL_PASOS_CAPTACION - 1;
  const puedeAvanzarPaso0 = !!contactoId;
  const puedeAvanzarPropiedad = direccion.trim().length > 0;
  const bloqueado = (paso === 0 && !puedeAvanzarPaso0) || (paso === 5 && !puedeAvanzarPropiedad);

  const tituloPaso = paso === 0 ? "Bienvenida" : paso >= 1 && paso <= 4 ? DEC_PILARES[paso - 1].titulo : paso === 5 ? "Datos de la propiedad" : paso === 6 ? "Características" : paso === 7 ? "Checklist de documentos" : "Resumen";

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Progreso */}
      <div className="shrink-0 border-b border-black/5 px-4 py-3">
        <div className="mb-2 flex items-center justify-between">
          <button onClick={reiniciarYCerrar} className="text-sm font-medium text-black/40">Cancelar</button>
          <span className="text-xs font-bold uppercase tracking-wide text-brand-700">Paso {paso + 1} de {TOTAL_PASOS_CAPTACION} · {tituloPaso}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-brand-600 transition-all" style={{ width: `${((paso + 1) / TOTAL_PASOS_CAPTACION) * 100}%` }} />
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto px-4 py-6">
        {paso === 0 && (
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Captación guiada</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-gray-900">Método DEC</h1>
            <p className="mt-1 text-base font-semibold text-gray-500">Diagnóstico · Estrategia · Comercialización</p>
            <p className="mt-4 text-base text-gray-600">Antes de comercializar una propiedad, hacemos un diagnóstico profesional en 4 pasos para diseñar una estrategia que realmente vende — no una genérica.</p>
            <h2 className="mb-3 mt-8 text-lg font-bold text-gray-900">¿A quién le vas a captar la propiedad?</h2>
            <div className="flex flex-col gap-2.5">
              {contactos.map((c) => (
                <TarjetaSeleccion key={c.id} seleccionado={contactoId === c.id} onClick={() => setContactoId(c.id)}>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{c.nombre.charAt(0).toUpperCase()}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-gray-900">{c.nombre}</p>
                    <p className="truncate text-sm text-black/45">{c.empresa || c.ciudad || "—"}</p>
                  </div>
                  {contactoId === c.id && <Icon.Check className="h-6 w-6 shrink-0 text-brand-600" />}
                </TarjetaSeleccion>
              ))}
            </div>
          </div>
        )}

        {paso >= 1 && paso <= 4 && (() => {
          const pilar = DEC_PILARES[paso - 1];
          return (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-3xl">{pilar.icono}</span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Pilar {pilar.numero} de 4 · {pilar.subtitulo}</p>
                  <h1 className="font-display text-2xl font-bold text-gray-900">{pilar.titulo}</h1>
                </div>
              </div>
              <p className="mb-6 text-base text-gray-600">{pilar.descripcion}</p>
              <div className="flex flex-col gap-5">
                {pilar.preguntas.map((q) => (
                  <div key={q.id}>
                    <label className="mb-1.5 block text-base font-semibold text-gray-800">{q.texto}</label>
                    <textarea rows={2} value={respuestas[pilar.id][q.id] || ""} onChange={(e) => responder(pilar.id, q.id, e.target.value)}
                      placeholder="Escribe la respuesta (opcional)…" className={campoClass} />
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {paso === 5 && (
          <div>
            <h1 className="mb-5 font-display text-2xl font-bold text-gray-900">Datos de la propiedad</h1>
            <p className="mb-2 text-base font-semibold text-gray-800">Tipo de inmueble</p>
            <div className="mb-5 grid grid-cols-3 gap-2.5">
              {Object.keys(TIPO_INMUEBLE_LABEL).map((t) => (
                <TarjetaSeleccion key={t} seleccionado={tipoInmueble === t} onClick={() => setTipoInmueble(t)} className="flex-col items-center justify-center gap-1.5 py-5 text-center">
                  <Icon.Home className="h-6 w-6 text-brand-700" />
                  <span className="text-sm font-semibold text-gray-800">{TIPO_INMUEBLE_LABEL[t]}</span>
                </TarjetaSeleccion>
              ))}
            </div>
            <p className="mb-2 text-base font-semibold text-gray-800">Operación</p>
            <div className="mb-5 grid grid-cols-2 gap-2.5">
              {Object.keys(OPERACION_INMUEBLE_LABEL).map((o) => (
                <TarjetaSeleccion key={o} seleccionado={operacion === o} onClick={() => setOperacion(o)} className="justify-center py-4 text-center">
                  <span className="text-base font-bold text-gray-800">{OPERACION_INMUEBLE_LABEL[o]}</span>
                </TarjetaSeleccion>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              <Field label="Dirección *"><input className={campoClass} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Ej. Colonia Escalón, pasaje 3" /></Field>
              <Field label="Zona"><input className={campoClass} value={zona} onChange={(e) => setZona(e.target.value)} /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Precio (USD)"><input type="number" className={campoClass} value={precio} onChange={(e) => setPrecio(e.target.value)} /></Field>
                <Field label="Comisión (%)"><input type="number" className={campoClass} value={comisionPct} onChange={(e) => setComisionPct(e.target.value)} /></Field>
              </div>
              <div>
                <Field label="Área de terreno">
                  <div className="flex gap-2">
                    <input type="number" className={campoClass} value={areaTerreno} onChange={(e) => setAreaTerreno(e.target.value)} />
                    <div className="flex shrink-0 overflow-hidden rounded-2xl border border-black/10">
                      {Object.keys(UNIDAD_TERRENO_LABEL).map((u) => (
                        <button key={u} type="button" onClick={() => setUnidadTerreno(u)}
                          className={`px-3 text-sm font-semibold ${unidadTerreno === u ? "bg-brand-700 text-white" : "bg-white text-gray-500"}`}>
                          {UNIDAD_TERRENO_LABEL[u]}
                        </button>
                      ))}
                    </div>
                  </div>
                </Field>
                <p className="mt-1 text-xs text-black/40">En El Salvador el terreno suele medirse en varas²; la construcción siempre en m².</p>
              </div>
              <Field label="Área de construcción (m²)"><input type="number" className={campoClass} value={areaConstruccion} onChange={(e) => setAreaConstruccion(e.target.value)} /></Field>
              <Field label="Antigüedad (años)"><input type="number" className={campoClass} value={antiguedad} onChange={(e) => setAntiguedad(e.target.value)} /></Field>
              <label className="flex items-center gap-2.5 rounded-2xl border border-black/10 bg-gray-50 px-4 py-3.5 text-base text-gray-800">
                <input type="checkbox" checked={remodelada} onChange={(e) => setRemodelada(e.target.checked)} />
                La propiedad está remodelada
              </label>
              <label className="flex items-center gap-2.5 rounded-2xl border border-black/10 bg-gray-50 px-4 py-3.5 text-base text-gray-800">
                <input type="checkbox" checked={amueblada} onChange={(e) => setAmueblada(e.target.checked)} />
                La propiedad está amueblada
              </label>
              <p className="text-xs text-black/45">Estos datos alimentan el Análisis Comparativo de Mercado (ACM) más adelante.</p>
            </div>
          </div>
        )}

        {paso === 6 && (
          <div>
            {espacioAbierto === null ? (
              <>
                <h1 className="mb-1 font-display text-2xl font-bold text-gray-900">Características de la propiedad</h1>
                <p className="mb-5 text-base text-gray-600">Toca un espacio para seleccionarlo y configurar sus características.</p>
                <div className="grid grid-cols-3 gap-2.5">
                  {ESPACIOS_CATALOGO.map((esp) => {
                    const seleccionado = !!espacios[esp.id];
                    return (
                      <button key={esp.id} onClick={() => toggleEspacio(esp.id)}
                        className={`relative flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 px-2 py-4 text-center transition ${seleccionado ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"}`}>
                        {seleccionado && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-white"><Icon.Check className="h-3 w-3" /></span>}
                        <span className="text-2xl">{esp.icono}</span>
                        <span className="text-xs font-semibold leading-tight text-gray-700">{esp.nombre}</span>
                      </button>
                    );
                  })}
                </div>

                {Object.keys(espacios).length > 0 && (
                  <div className="mt-7">
                    <h2 className="mb-2.5 text-base font-bold text-gray-900">Espacios seleccionados</h2>
                    <div className="flex flex-col gap-2">
                      {Object.keys(espacios).map((id) => {
                        const catalogo = ESPACIOS_CATALOGO.find((e) => e.id === id);
                        const datos = espacios[id];
                        const totalContadores = catalogo.contadores.reduce((n, ct) => n + (datos.contadores[ct.id] || 0), 0);
                        const nCaracteristicas = Object.values(datos.caracteristicas).filter((v) => v === true || (typeof v === "string" && v.trim())).length;
                        return (
                          <button key={id} onClick={() => setEspacioAbierto(id)} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-left">
                            <div className="flex items-center gap-2.5">
                              <span className="text-xl">{catalogo.icono}</span>
                              <span className="text-base font-semibold text-gray-900">{catalogo.nombre}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {catalogo.contadores.length > 0 ? (
                                <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">{totalContadores}</span>
                              ) : nCaracteristicas > 0 ? (
                                <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">{nCaracteristicas} ✓</span>
                              ) : (
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">Configurar</span>
                              )}
                              <Icon.Chevron className="h-4 w-4 text-black/25" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : (() => {
              const esp = ESPACIOS_CATALOGO.find((e) => e.id === espacioAbierto);
              const datos = espacios[espacioAbierto];

              // Nivel 3: configurando una unidad específica (ej. "Habitación junior 2")
              if (esp.caracteristicasPorUnidad && unidadAbierta) {
                const { contadorId, index } = unidadAbierta;
                const ct = esp.contadores.find((c) => c.id === contadorId);
                const totalDeEsteTipo = datos.contadores[contadorId] || 0;
                const etiqueta = totalDeEsteTipo > 1 ? `${ct.nombre} ${index + 1}` : ct.nombre;
                const unidad = datos.unidades[contadorId][index];
                const toggles = esp.caracteristicas.filter((c) => c.tipo === "toggle" || c.tipo === "contador");
                const textos = esp.caracteristicas.filter((c) => c.tipo === "texto");
                return (
                  <div>
                    <button onClick={() => setUnidadAbierta(null)} className="mb-4 text-sm font-semibold text-brand-700">← Volver a {esp.nombre.toLowerCase()}</button>
                    <div className="mb-5 flex items-center gap-3">
                      <span className="text-3xl">{esp.icono}</span>
                      <h1 className="font-display text-2xl font-bold text-gray-900">{etiqueta}</h1>
                    </div>
                    <p className="mb-2 text-base font-semibold text-gray-800">Características de esta {esp.id === "banos" ? "unidad" : "habitación"}</p>
                    <div className="mb-5 grid grid-cols-2 gap-2.5">
                      {toggles.map((c) => c.tipo === "contador" ? (
                        <div key={c.id} className="col-span-2">
                          <ContadorGrande label={c.nombre} valor={unidad.caracteristicas[c.id] || 0} onCambiar={(v) => actualizarCaracteristicaUnidad(espacioAbierto, contadorId, index, c.id, v)} />
                        </div>
                      ) : (
                        <TarjetaSeleccion key={c.id} seleccionado={!!unidad.caracteristicas[c.id]}
                          onClick={() => actualizarCaracteristicaUnidad(espacioAbierto, contadorId, index, c.id, !unidad.caracteristicas[c.id])}
                          className="justify-center py-3.5 text-center">
                          <span className="text-sm font-semibold">{c.nombre}</span>
                        </TarjetaSeleccion>
                      ))}
                    </div>
                    {textos.length > 0 && (
                      <>
                        <p className="mb-2 text-base font-semibold text-gray-800">Detalles adicionales</p>
                        <div className="mb-6 flex flex-col gap-3">
                          {textos.map((c) => (
                            <Field key={c.id} label={c.nombre}>
                              <input className="w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-base outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
                                value={unidad.caracteristicas[c.id] || ""} onChange={(e) => actualizarCaracteristicaUnidad(espacioAbierto, contadorId, index, c.id, e.target.value)} />
                            </Field>
                          ))}
                        </div>
                      </>
                    )}
                    <BotonGrande variant="primary" onClick={() => setUnidadAbierta(null)} className="w-full">Guardar y volver</BotonGrande>
                  </div>
                );
              }

              // Nivel 2: pantalla del espacio — contadores + (lista de unidades a configurar, o características globales)
              const toggles = esp.caracteristicas.filter((c) => c.tipo === "toggle" || c.tipo === "contador");
              const textos = esp.caracteristicas.filter((c) => c.tipo === "texto");
              return (
                <div>
                  <button onClick={() => setEspacioAbierto(null)} className="mb-4 text-sm font-semibold text-brand-700">← Volver a espacios</button>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="text-3xl">{esp.icono}</span>
                    <h1 className="font-display text-2xl font-bold text-gray-900">{esp.nombre}</h1>
                  </div>

                  {esp.contadores.length > 0 && (
                    <div className="mb-5 flex flex-col gap-2.5">
                      {esp.contadores.map((ct) => (
                        <ContadorGrande key={ct.id} label={ct.nombre} valor={datos.contadores[ct.id] || 0} onCambiar={(v) => actualizarContador(espacioAbierto, ct.id, v)} />
                      ))}
                    </div>
                  )}

                  {esp.caracteristicasPorUnidad ? (
                    <>
                      <p className="mb-1 text-base font-semibold text-gray-800">Configura cada una</p>
                      <p className="mb-3 text-sm text-gray-500">Así podés indicar, por ejemplo, cuál tiene baño privado y cuál no.</p>
                      {esp.contadores.every((ct) => !(datos.contadores[ct.id] > 0)) ? (
                        <p className="rounded-2xl border border-dashed border-black/10 px-4 py-4 text-sm text-black/40">Sumá al menos una cantidad arriba para poder configurarla.</p>
                      ) : (
                        <div className="mb-6 flex flex-col gap-2">
                          {esp.contadores.map((ct) => {
                            const total = datos.contadores[ct.id] || 0;
                            if (total === 0) return null;
                            return Array.from({ length: total }).map((_, idx) => {
                              const unidad = datos.unidades[ct.id][idx];
                              const nCaract = unidad ? Object.values(unidad.caracteristicas).filter((v) => v === true || (typeof v === "string" && v.trim())).length : 0;
                              const etiqueta = total > 1 ? `${ct.nombre} ${idx + 1}` : ct.nombre;
                              return (
                                <button key={`${ct.id}-${idx}`} onClick={() => setUnidadAbierta({ contadorId: ct.id, index: idx })}
                                  className="flex items-center justify-between rounded-2xl border border-black/10 bg-white px-4 py-3.5 text-left">
                                  <span className="text-base font-semibold text-gray-900">{etiqueta}</span>
                                  <div className="flex items-center gap-2">
                                    {nCaract > 0 ? (
                                      <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700">{nCaract} ✓</span>
                                    ) : (
                                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-500">Configurar</span>
                                    )}
                                    <Icon.Chevron className="h-4 w-4 text-black/25" />
                                  </div>
                                </button>
                              );
                            });
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mb-2 text-base font-semibold text-gray-800">Características</p>
                      <div className="mb-5 grid grid-cols-2 gap-2.5">
                        {toggles.map((c) => c.tipo === "contador" ? (
                          <div key={c.id} className="col-span-2">
                            <ContadorGrande label={c.nombre} valor={datos.caracteristicas[c.id] || 0} onCambiar={(v) => actualizarCaracteristica(espacioAbierto, c.id, v)} />
                          </div>
                        ) : (
                          <TarjetaSeleccion key={c.id} seleccionado={!!datos.caracteristicas[c.id]}
                            onClick={() => actualizarCaracteristica(espacioAbierto, c.id, !datos.caracteristicas[c.id])}
                            className="justify-center py-3.5 text-center">
                            <span className="text-sm font-semibold">{c.nombre}</span>
                          </TarjetaSeleccion>
                        ))}
                      </div>

                      {textos.length > 0 && (
                        <>
                          <p className="mb-2 text-base font-semibold text-gray-800">Detalles adicionales</p>
                          <div className="mb-6 flex flex-col gap-3">
                            {textos.map((c) => (
                              <Field key={c.id} label={c.nombre}>
                                <input className="w-full rounded-2xl border border-black/10 bg-gray-50 px-4 py-3 text-base outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15"
                                  value={datos.caracteristicas[c.id] || ""} onChange={(e) => actualizarCaracteristica(espacioAbierto, c.id, e.target.value)} />
                              </Field>
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  )}

                  <BotonGrande variant="primary" onClick={() => setEspacioAbierto(null)} className="w-full">Guardar y volver</BotonGrande>
                </div>
              );
            })()}
          </div>
        )}

        {paso === 7 && (
          <div>
            <h1 className="mb-2 font-display text-2xl font-bold text-gray-900">Checklist de documentos</h1>
            <p className="mb-5 text-base text-gray-600">La propiedad no se podrá publicar hasta completar estos documentos.</p>
            <div className="flex flex-col gap-2.5">
              {checklist.map((it) => (
                <button key={it.id} onClick={() => toggleItemChecklist(it.id)}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-4 text-left transition ${it.completado ? "border-brand-600 bg-brand-50" : "border-gray-200 bg-white"}`}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${it.completado ? "bg-brand-600 text-white" : "border-2 border-gray-300"}`}>
                    {it.completado && <Icon.Check className="h-5 w-5" />}
                  </span>
                  <span className={`text-base font-medium ${it.completado ? "text-brand-800" : "text-gray-700"}`}>{it.nombre}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {paso === 8 && (() => {
          const propietario = contactos.find((c) => c.id === contactoId);
          const hechos = checklist.filter((it) => it.completado).length;
          return (
            <div>
              <h1 className="mb-1 font-display text-2xl font-bold text-gray-900">Resumen</h1>
              <p className="mb-6 text-base text-gray-600">Revisa antes de crear la captación.</p>

              <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-black/40">Propietario</p>
                <p className="text-base font-semibold text-gray-900">{propietario?.nombre || "—"}</p>
              </div>
              <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-black/40">Propiedad</p>
                <p className="text-base font-semibold text-gray-900">{TIPO_INMUEBLE_LABEL[tipoInmueble]} en {OPERACION_INMUEBLE_LABEL[operacion]} · {direccion || "sin dirección"}</p>
                <p className="text-sm text-black/50">{formatMoney(precio ? Number(precio) : null)} · Comisión {comisionPct}%</p>
              </div>
              <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-black/40">Espacios y características</p>
                <p className="text-base font-semibold text-gray-900">{Object.keys(espacios).length} espacio(s) configurados</p>
              </div>
              <div className="mb-4 rounded-2xl bg-gray-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-black/40">Checklist</p>
                <p className="text-base font-semibold text-gray-900">{hechos} de {checklist.length} documentos completos</p>
              </div>
              <div className="rounded-2xl bg-brand-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-700">Diagnóstico DEC</p>
                <p className="text-sm text-brand-800">
                  {DEC_PILARES.reduce((n, p) => n + Object.values(respuestas[p.id]).filter((v) => v && v.trim()).length, 0)} preguntas respondidas de {DEC_PILARES.length * 5}
                </p>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Navegación */}
      <div className="shrink-0 border-t border-black/5 bg-white p-4">
        <div className="mx-auto flex max-w-2xl gap-3">
          {paso > 0 && <BotonGrande variant="secondary" onClick={() => setPaso((p) => p - 1)} className="flex-1">Atrás</BotonGrande>}
          <BotonGrande variant="primary" onClick={() => (esUltimoPaso ? crear() : setPaso((p) => p + 1))} disabled={bloqueado} className={paso > 0 ? "flex-[2]" : "w-full"}>
            {esUltimoPaso ? "Crear captación" : "Siguiente"}
          </BotonGrande>
        </div>
      </div>
    </div>
  );
}
