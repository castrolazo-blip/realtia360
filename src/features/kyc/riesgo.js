// Motor de riesgo AML/KYC — reglas simples y explicables (nada de IA ni caja negra): cada
// factor suma puntos por una razón concreta y auditable. Igual que el resto de Realtia
// (matching.js, negocio.js), el objetivo es que cualquier persona pueda entender por qué
// un caso salió "alto riesgo" con solo mirar la lista de factores.
const FACTORES = [
  { clave: "efectivo", puntos: 30, etiqueta: "Pago en efectivo", cumple: (d) => d.formaPago === "efectivo" },
  { clave: "montoAlto", puntos: 25, etiqueta: "Transacción de monto alto (> $200,000)", cumple: (d) => (d.montoTransaccion || 0) > 200000 },
  { clave: "montoMedio", puntos: 12, etiqueta: "Transacción de monto considerable (> $75,000)", cumple: (d) => (d.montoTransaccion || 0) > 75000 && (d.montoTransaccion || 0) <= 200000 },
  { clave: "pep", puntos: 30, etiqueta: "Persona expuesta políticamente (PEP)", cumple: (d) => !!d.personaExpuestaPoliticamente },
  { clave: "paisRiesgo", puntos: 20, etiqueta: "País de alto riesgo (según criterio del agente)", cumple: (d) => !!d.paisAltoRiesgo },
  { clave: "sinOrigen", puntos: 10, etiqueta: "Origen de fondos no declarado", cumple: (d) => !d.origenFondos },
  { clave: "listaSancion", puntos: 40, etiqueta: "Coincidencia en lista de sanciones (OFAC)", cumple: (d) => !!d.coincidenciaListas },
];

export function calcularRiesgo(datos) {
  const factoresAplicados = FACTORES.map((f) => ({ etiqueta: f.etiqueta, puntos: f.puntos, cumple: f.cumple(datos) }));
  const puntaje = Math.min(100, factoresAplicados.reduce((s, f) => s + (f.cumple ? f.puntos : 0), 0));
  const nivel = puntaje >= 55 ? "alto" : puntaje >= 25 ? "medio" : "bajo";
  return { puntaje, nivel, factores: factoresAplicados };
}
