// Motor de reglas (no IA real): calcula similitud y sugiere ajustes de valor
// comparando la propiedad captada contra cada comparable que el asesor ingresa.

export function calcularSimilitud(subject, comp) {
  let score = 100;
  if (subject.areaTerreno && comp.areaTerreno) {
    const diffPct = Math.abs(subject.areaTerreno - comp.areaTerreno) / subject.areaTerreno;
    score -= Math.min(15, diffPct * 100 * 0.6);
  }
  if (subject.areaConstruccion && comp.areaConstruccion) {
    const diffPct = Math.abs(subject.areaConstruccion - comp.areaConstruccion) / subject.areaConstruccion;
    score -= Math.min(25, diffPct * 100);
  }
  if (subject.habitaciones && comp.habitaciones != null) score -= Math.min(15, Math.abs(subject.habitaciones - comp.habitaciones) * 6);
  if (subject.banos && comp.banos != null) score -= Math.min(15, Math.abs(subject.banos - comp.banos) * 5);
  if (subject.parqueos && comp.parqueos != null) score -= Math.min(8, Math.abs(subject.parqueos - comp.parqueos) * 3);
  if (subject.remodelada !== !!comp.remodelada) score -= 8;
  if (subject.amueblada !== !!comp.amueblado) score -= 4;
  if (subject.piscina !== !!comp.piscina) score -= 5;
  if (subject.seguridad !== !!comp.seguridad) score -= 5;
  return Math.max(0, Math.round(score));
}

export function calcularAjustes(subject, comp) {
  const ajustes = [];
  if (subject.habitaciones && comp.habitaciones != null && subject.habitaciones !== comp.habitaciones) {
    const diff = subject.habitaciones - comp.habitaciones;
    ajustes.push({ motivo: `${Math.abs(diff)} habitación${Math.abs(diff) > 1 ? "es" : ""} ${diff > 0 ? "menos" : "más"} que la propiedad captada`, monto: diff * 6000 });
  }
  if (subject.banos && comp.banos != null && subject.banos !== comp.banos) {
    const diff = subject.banos - comp.banos;
    ajustes.push({ motivo: `${Math.abs(diff)} baño(s) ${diff > 0 ? "menos" : "más"}`, monto: diff * 4000 });
  }
  if (subject.parqueos && comp.parqueos != null && subject.parqueos !== comp.parqueos) {
    const diff = subject.parqueos - comp.parqueos;
    ajustes.push({ motivo: `${Math.abs(diff)} parqueo(s) ${diff > 0 ? "menos" : "más"}`, monto: diff * 3000 });
  }
  if (subject.areaConstruccion && comp.areaConstruccion && Math.abs(subject.areaConstruccion - comp.areaConstruccion) >= 5) {
    const diffArea = subject.areaConstruccion - comp.areaConstruccion;
    const valorM2 = comp.areaConstruccion ? comp.precio / comp.areaConstruccion : 800;
    ajustes.push({ motivo: `${Math.abs(Math.round(diffArea))} m² ${diffArea > 0 ? "menos" : "más"} de construcción`, monto: Math.round(diffArea * valorM2 * 0.5) });
  }
  if (subject.areaTerreno && comp.areaTerreno && Math.abs(subject.areaTerreno - comp.areaTerreno) >= 10) {
    const diffTerreno = subject.areaTerreno - comp.areaTerreno;
    const valorVara2 = comp.areaTerreno ? comp.precio / comp.areaTerreno : 150;
    ajustes.push({ motivo: `${Math.abs(Math.round(diffTerreno))} v² ${diffTerreno > 0 ? "menos" : "más"} de terreno`, monto: Math.round(diffTerreno * valorVara2 * 0.3) });
  }
  if (subject.remodelada && !comp.remodelada) ajustes.push({ motivo: "Comparable no está remodelado", monto: 5000 });
  if (!subject.remodelada && comp.remodelada) ajustes.push({ motivo: "Comparable está remodelado y la propiedad captada no", monto: -5000 });
  if (subject.amueblada && !comp.amueblado) ajustes.push({ motivo: "Comparable no está amueblado", monto: 3000 });
  if (!subject.amueblada && comp.amueblado) ajustes.push({ motivo: "Comparable está amueblado y la propiedad captada no", monto: -3000 });
  if (subject.piscina && !comp.piscina) ajustes.push({ motivo: "Comparable no tiene piscina", monto: 4000 });
  if (!subject.piscina && comp.piscina) ajustes.push({ motivo: "Comparable tiene piscina y la propiedad captada no", monto: -4000 });
  if (subject.seguridad && !comp.seguridad) ajustes.push({ motivo: "Comparable no tiene seguridad 24/7", monto: 2000 });
  if (!subject.seguridad && comp.seguridad) ajustes.push({ motivo: "Comparable tiene seguridad 24/7 y la propiedad captada no", monto: -2000 });
  return ajustes;
}
