// Método DEC (Diagnóstico · Estrategia · Comercialización).
// Los 4 pilares del diagnóstico, con sus preguntas clave tal como en la capacitación comercial.
export const DEC_PILARES = [
  {
    id: "cliente", numero: 1, icono: "👥", titulo: "Descubrir al cliente", subtitulo: "El porqué",
    descripcion: "Entendemos la motivación real, los objetivos y la urgencia del propietario.",
    preguntas: [
      { id: "q1", texto: "¿Qué pasa si la propiedad no se vende en los próximos 3 o 6 meses?" },
      { id: "q2", texto: "¿Qué define una venta exitosa para usted: precio, velocidad o discreción?" },
      { id: "q3", texto: "¿Por qué quiere vender ahora?" },
      { id: "q4", texto: "¿Ya compró otra propiedad?" },
      { id: "q5", texto: "¿Tiene alguna deuda o compromiso asociado a la propiedad?" },
    ],
  },
  {
    id: "propiedad", numero: 2, icono: "🏠", titulo: "Conocer la propiedad", subtitulo: "Lo invisible",
    descripcion: "Descubrimos los atributos únicos, mejoras y ventajas que la hacen especial.",
    preguntas: [
      { id: "q1", texto: 'Cuando compró esta propiedad, ¿qué fue lo que le hizo decir "esta es"?' },
      { id: "q2", texto: "¿Qué es lo que más va a extrañar de vivir aquí?" },
      { id: "q3", texto: "¿Qué mejoras o remodelaciones ha realizado?" },
      { id: "q4", texto: "¿Qué problemas ha solucionado en la propiedad?" },
      { id: "q5", texto: "¿Qué ventajas tiene la ubicación y su entorno?" },
    ],
  },
  {
    id: "mercado", numero: 3, icono: "📈", titulo: "Conocer el mercado", subtitulo: "La realidad",
    descripcion: "Analizamos el mercado real para tomar decisiones estratégicas basadas en datos.",
    preguntas: [
      { id: "q1", texto: "¿Cuáles son las propiedades competitivas activas en la zona?" },
      { id: "q2", texto: "¿Cuál es el precio de cierre real de propiedades similares?" },
      { id: "q3", texto: "¿Cuál es el tiempo promedio de absorción en la zona?" },
      { id: "q4", texto: "¿Qué tendencias están afectando la demanda?" },
      { id: "q5", texto: "¿Cuáles son las ventajas y debilidades frente a la competencia?" },
    ],
  },
  {
    id: "comprador", numero: 4, icono: "🎯", titulo: "Definir al comprador ideal", subtitulo: "El enfoque",
    descripcion: "Identificamos el perfil exacto del comprador con más probabilidad de comprar esta propiedad.",
    preguntas: [
      { id: "q1", texto: "¿A quién va dirigida realmente esta propiedad?" },
      { id: "q2", texto: "¿Es para una familia, inversionista, empresa, extranjero o constructor?" },
      { id: "q3", texto: "¿Qué necesidades, deseos y objeciones tiene este perfil?" },
      { id: "q4", texto: "¿En qué canales y redes se informa este tipo de comprador?" },
      { id: "q5", texto: "¿Qué mensaje conectará con él?" },
    ],
  },
];
