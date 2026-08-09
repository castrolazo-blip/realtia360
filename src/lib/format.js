export const formatMoney = (v) =>
  v == null ? "—" : new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
