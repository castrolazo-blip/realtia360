// Plan de negocio anual — sigue el cuaderno "Business Plan" de la oficina: compromiso,
// visión/misión/valores/por qué, logros del año que termina, metas del año del plan en 5
// áreas de la vida, metas de negocio y clientes que pueden cerrar este año.

export const AREAS_VIDA = [
  { key: "negocio", label: "Negocio", icono: "💼", ejemplo: "Ej.: Cerrar 12 transacciones y captar 20 propiedades" },
  { key: "financiero", label: "Financiero", icono: "💰", ejemplo: "Ej.: Ahorrar el 20% de cada comisión" },
  { key: "personal", label: "Personal", icono: "🌱", ejemplo: "Ej.: Hacer ejercicio 3 veces por semana" },
  { key: "familia", label: "Familia", icono: "👨‍👩‍👧", ejemplo: "Ej.: Cenar en familia todos los domingos" },
  { key: "espiritual", label: "Espiritual", icono: "🙏", ejemplo: "Ej.: Dedicar un momento diario a agradecer" },
];

export const VALORES_SUGERIDOS = [
  "Honestidad", "Servicio", "Excelencia", "Compromiso", "Familia", "Disciplina", "Lealtad",
  "Respeto", "Responsabilidad", "Fe", "Perseverancia", "Gratitud", "Trabajo en equipo", "Transparencia",
];

// Frases para tocar y luego ajustar — así el asesor escribe lo mínimo.
export const FRASES = {
  vision: [
    "Ser el asesor inmobiliario de referencia en mi zona, reconocido por su servicio y resultados.",
    "Construir una cartera de clientes que me recomienden por confianza y profesionalismo.",
    "Lograr libertad financiera ayudando a las familias a encontrar su hogar ideal.",
  ],
  mision: [
    "Acompañar a cada cliente con honestidad y conocimiento del mercado en la compra, venta o alquiler de su propiedad.",
    "Dar un servicio cercano y profesional que convierta cada operación en una recomendación.",
    "Ayudar a las personas a tomar la mejor decisión inmobiliaria con información clara y seguimiento constante.",
  ],
  por_que: [
    "Por mi familia: quiero darles estabilidad y tiempo de calidad.",
    "Porque quiero demostrarme que puedo lograr todo lo que me propongo.",
    "Para tener libertad financiera y la vida que sueño.",
    "Porque me apasiona ayudar a las personas a cumplir el sueño de su casa propia.",
  ],
};

export const METAS_MONETARIAS = [24000, 36000, 48000, 60000, 84000, 120000];
export const COMISIONES_PROMEDIO = [2500, 3500, 5000, 7500, 10000];

// Tasas para bajar la meta anual hasta el día (se podrán ajustar por oficina más adelante):
// de cada 10 llamadas, 4 son contactos efectivos; de cada 10 efectivos, 3 dan cita; de cada
// 10 citas, 1 termina en cierre.
export const CONVERSION_DEFECTO = { efectivos: 0.4, citas: 0.3, cierres: 0.1 };
export const SEMANAS_LABORALES = 48;
export const DIAS_LABORALES = 240;

// El plan se hace para el año que viene a partir de octubre (temporada de planes).
export const anioDelPlan = (fecha = new Date()) => (fecha.getMonth() >= 9 ? fecha.getFullYear() + 1 : fecha.getFullYear());
