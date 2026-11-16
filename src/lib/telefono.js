// Teléfonos de El Salvador: se guardan siempre como +503XXXXXXXX para poder detectar
// duplicados sin importar cómo los escribió cada quien ("7012-3456", "503 7012 3456"…).
export function normalizarTelefono(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  const conMas = s.startsWith("+");
  const d = s.replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("00")) return "+" + d.slice(2);
  if (conMas) return "+" + d;
  if (d.length === 8) return "+503" + d;
  if (d.length === 11 && d.startsWith("503")) return "+" + d;
  if (d.length < 7) return "";
  return "+" + d;
}

export function formatTelefono(t) {
  const m = /^\+503(\d{4})(\d{4})$/.exec(t || "");
  return m ? `+503 ${m[1]}-${m[2]}` : t || "";
}

// Índice teléfono normalizado → id de contacto, para detectar duplicados.
export function indicePorTelefono(contactos) {
  const idx = {};
  for (const c of contactos) {
    const t = normalizarTelefono(c.telefono);
    if (t) idx[t] = c.id;
  }
  return idx;
}
