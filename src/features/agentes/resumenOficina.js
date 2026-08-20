// Agrega la cartera cruda de toda la oficina (oficinaCartera, filas snake_case tal como
// vienen de Supabase) por agente. Un solo lugar para este cálculo — lo usan tanto Office
// Pulse (resumen compacto) como Agentes (detalle por asesor), para no mantener dos
// versiones de la misma cuenta.
export function calcularResumenPorAgente(equipo, oficinaCartera) {
  const ahora = new Date();
  const mapa = new Map(
    equipo.map((p) => [
      p.id,
      {
        id: p.id,
        nombre: p.nombre_agente,
        esBroker: p.rol === "broker",
        contactos: 0,
        oportunidadesActivas: 0,
        cierres: 0,
        valorCerrado: 0,
        captaciones: 0,
        captacionesPublicadas: 0,
        actividadesPendientes: 0,
        actividadesVencidas: 0,
      },
    ])
  );

  for (const c of oficinaCartera.contactos) {
    const f = mapa.get(c.agente_id);
    if (f) f.contactos++;
  }
  for (const o of oficinaCartera.oportunidades) {
    const f = mapa.get(o.agente_id);
    if (!f) continue;
    if (o.estado === "activa") f.oportunidadesActivas++;
    if (o.estado === "ganada") { f.cierres++; f.valorCerrado += Number(o.valor || 0); }
  }
  for (const c of oficinaCartera.captaciones) {
    const f = mapa.get(c.agente_id);
    if (!f) continue;
    f.captaciones++;
    if (c.estado === "publicada") f.captacionesPublicadas++;
  }
  for (const a of oficinaCartera.actividades) {
    const f = mapa.get(a.agente_id);
    if (!f || a.estado !== "pendiente") continue;
    f.actividadesPendientes++;
    if (new Date(a.fecha_hora) < ahora) f.actividadesVencidas++;
  }

  return [...mapa.values()].sort((a, b) => b.valorCerrado - a.valorCerrado || b.contactos - a.contactos);
}

export function calcularTotalesOficina(porAgente) {
  return porAgente.reduce(
    (t, a) => ({
      contactos: t.contactos + a.contactos,
      oportunidadesActivas: t.oportunidadesActivas + a.oportunidadesActivas,
      cierres: t.cierres + a.cierres,
      valorCerrado: t.valorCerrado + a.valorCerrado,
      captaciones: t.captaciones + a.captaciones,
      captacionesPublicadas: t.captacionesPublicadas + a.captacionesPublicadas,
      actividadesPendientes: t.actividadesPendientes + a.actividadesPendientes,
      actividadesVencidas: t.actividadesVencidas + a.actividadesVencidas,
    }),
    { contactos: 0, oportunidadesActivas: 0, cierres: 0, valorCerrado: 0, captaciones: 0, captacionesPublicadas: 0, actividadesPendientes: 0, actividadesVencidas: 0 }
  );
}
