export const conHora = (offsetDias, h = 12, m = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDias);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const fmtMesDia = (iso) => {
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export const diasDesde = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : null);

export const haceTiempo = (iso) => {
  const dias = diasDesde(iso);
  if (dias == null) return "";
  if (dias === 0) return "Hoy";
  if (dias === 1) return "Ayer";
  if (dias < 30) return `Hace ${dias} días`;
  const meses = Math.floor(dias / 30);
  return meses === 1 ? "Hace 1 mes" : `Hace ${meses} meses`;
};

export const diasHastaProximoCumple = (mesDia) => {
  if (!mesDia) return null;
  const [mes, dia] = mesDia.split("-").map(Number);
  const t = new Date();
  let prox = new Date(t.getFullYear(), mes - 1, dia);
  if (prox < new Date(t.getFullYear(), t.getMonth(), t.getDate())) prox = new Date(t.getFullYear() + 1, mes - 1, dia);
  return Math.round((prox - new Date(t.getFullYear(), t.getMonth(), t.getDate())) / 86400000);
};

export const formatHora = (iso) => new Date(iso).toLocaleTimeString("es-SV", { hour: "numeric", minute: "2-digit" });

export const mismoDia = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const formatDia = (iso) => {
  const d = new Date(iso);
  const t = new Date();
  const manana = new Date(t);
  manana.setDate(t.getDate() + 1);
  const ayer = new Date(t);
  ayer.setDate(t.getDate() - 1);
  if (mismoDia(d, t)) return "Hoy";
  if (mismoDia(d, manana)) return "Mañana";
  if (mismoDia(d, ayer)) return "Ayer";
  return d.toLocaleDateString("es-SV", { weekday: "short", day: "numeric", month: "short" });
};

export const toLocalInput = (iso) => {
  const d = new Date(iso);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export function obtenerDiasCalendario(fechaRef) {
  const inicioMes = new Date(fechaRef.getFullYear(), fechaRef.getMonth(), 1);
  const finMes = new Date(fechaRef.getFullYear(), fechaRef.getMonth() + 1, 0);
  const inicio = new Date(inicioMes);
  inicio.setDate(inicio.getDate() - inicio.getDay());
  const fin = new Date(finMes);
  fin.setDate(fin.getDate() + (6 - fin.getDay()));
  const dias = [];
  const cursor = new Date(inicio);
  while (cursor <= fin) {
    dias.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dias;
}

export function sumarDias(fecha, n) {
  const d = new Date(fecha);
  d.setDate(d.getDate() + n);
  return d;
}

export function sumarMeses(fecha, n) {
  const d = new Date(fecha);
  d.setMonth(d.getMonth() + n);
  return d;
}
