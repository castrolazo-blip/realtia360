import { conHora, fmtMesDia } from "../lib/dates.js";
import { CHECKLIST_BASE } from "../constants/captacion.js";

export const CONTACTOS_INICIALES = [
  { id: "c1", nombre: "María Fernanda López", empresa: null, ciudad: "San Salvador", clasificacion: "oportunidad_activa", telefono: "+503 7000-1111", correo: "mflopez@gmail.com",
    circulo: "redes_sociales", cercania: "Media", profesion: "Diseñadora gráfica", cumpleanos: "08-15", ultimoContacto: conHora(-5), potencialReferidos: "Medio", valorEstrategico: "estandar", intereses: "Decoración, yoga",
    notas: [
      { id: "n1c1", fecha: conHora(-5), texto: "Me contó que se fue de viaje a Europa con su esposo, muy emocionada. Preguntar cómo le fue." },
      { id: "n2c1", fecha: conHora(-19), texto: "Le gustó mucho la casa de Santa Elena, quiere ver una segunda opción con más jardín." },
    ] },
  { id: "c2", nombre: "Carlos Mejía", empresa: "Constructora Mejía", ciudad: "Santa Tecla", clasificacion: "contacto_relacion", telefono: "+503 7000-2222", correo: "carlos@constructoramejia.com",
    circulo: "aliados_estrategicos", cercania: "Alta", profesion: "Constructor", cumpleanos: "03-22", ultimoContacto: conHora(-10), potencialReferidos: "Alto", valorEstrategico: "vip", intereses: "Golf",
    notas: [
      { id: "n1c2", fecha: conHora(-10), texto: "Confirmó que su próximo proyecto en Santa Tecla arranca en 2 meses, quiere que le lleve compradores." },
    ] },
  { id: "c3", nombre: "Ana Beatriz Rivas", empresa: null, ciudad: "Antiguo Cuscatlán", clasificacion: "prospecto_futuro", telefono: "+503 7000-3333", correo: "ana.rivas@gmail.com",
    circulo: "iglesia", cercania: "Alta", profesion: "Contadora", cumpleanos: fmtMesDia(conHora(1, 12)), ultimoContacto: conHora(-20), potencialReferidos: "Medio", valorEstrategico: "estandar", intereses: "Repostería",
    notas: [
      { id: "n1c3", fecha: conHora(-20), texto: "Está pensando en vender su apartamento el próximo año cuando termine de pagar el carro." },
    ] },
  { id: "c4", nombre: "Roberto Quintanilla", empresa: null, ciudad: "San Salvador", clasificacion: "cliente_anterior", telefono: "+503 7000-4444", correo: "rquintanilla@gmail.com",
    circulo: "clientes_anteriores", cercania: "Media", profesion: "Empresario", cumpleanos: "11-02", ultimoContacto: conHora(-128), potencialReferidos: "Alto", valorEstrategico: "vip", intereses: "Pesca, inversiones",
    notas: [
      { id: "n1c4", fecha: conHora(-128), texto: "Cerramos la venta de su casa anterior. Quedó muy satisfecho, dijo que en un año buscaría invertir de nuevo." },
    ] },
  { id: "c5", nombre: "Grupo Inversiones del Valle", empresa: "GIV", ciudad: "San Salvador", clasificacion: "aliado_profesional", telefono: "+503 7000-5555", correo: "contacto@giv.com",
    circulo: "aliados_estrategicos", cercania: "Media", profesion: "Firma de inversión", cumpleanos: "", ultimoContacto: conHora(-60), potencialReferidos: "Alto", valorEstrategico: "vip", intereses: "",
    notas: [] },
  { id: "c6", nombre: "Carlos Handal", empresa: null, ciudad: "San Salvador", clasificacion: "contacto_relacion", telefono: "+503 7000-6666", correo: "carlos.handal@gmail.com",
    circulo: "amigos", cercania: "Alta", profesion: "Emprendedor", cumpleanos: "05-30", ultimoContacto: conHora(-128), potencialReferidos: "Medio", valorEstrategico: "estandar", intereses: "Fútbol, negocios",
    notas: [
      { id: "n1c6", fecha: conHora(-128), texto: "Coincidimos en el partido del sábado, me contó que está por abrir su segundo local." },
    ] },
];

export const OPORTUNIDADES_INICIALES = [
  { id: "o1", contactoId: "c1", tipo: "compra", etapa: "visitas", estado: "activa", valor: 185000, zona: "Santa Elena", proximaAccion: "Coordinar segunda visita", proximaFecha: conHora(2, 10) },
  { id: "o2", contactoId: "c2", tipo: "captacion", etapa: "nueva", estado: "activa", valor: 320000, zona: "Colonia Escalón", proximaAccion: "Enviar checklist de documentos", proximaFecha: conHora(1, 9) },
  { id: "o3", contactoId: "c3", tipo: "venta", etapa: "nueva", estado: "activa", valor: 96000, zona: "", proximaAccion: "", proximaFecha: "" },
  { id: "o4", contactoId: "c5", tipo: "inversion", etapa: "negociacion", estado: "activa", valor: 410000, zona: "Zona Rosa", proximaAccion: "Enviar propuesta final", proximaFecha: conHora(4, 11) },
];

export const ACTIVIDADES_INICIALES = [
  { id: "a1", contactoId: "c4", oportunidadId: null, tipo: "llamada", titulo: "Llamar para dar seguimiento a oferta", fechaHora: conHora(-2, 10), estado: "pendiente", duracion: 20 },
  { id: "a2", contactoId: "c1", oportunidadId: "o1", tipo: "visita", titulo: "Visita a propiedad con María Fernanda", fechaHora: conHora(0, 15), estado: "pendiente", duracion: 60 },
  { id: "a3", contactoId: "c3", oportunidadId: null, tipo: "seguimiento", titulo: "Toque de cumpleaños", fechaHora: conHora(3, 10), estado: "pendiente", duracion: 10 },
  { id: "a4", contactoId: "c5", oportunidadId: "o4", tipo: "reunion", titulo: "Reunión para revisar propuesta", fechaHora: conHora(0, 17), estado: "pendiente", duracion: 45 },
];

export const CAPTACIONES_INICIALES = [
  {
    id: "cap1", contactoId: "c2", tipoInmueble: "casa", operacion: "venta", direccion: "Colonia Escalón, pasaje 3",
    zona: "Colonia Escalón", precio: 320000, comisionPct: 5, estado: "documentos_pendientes", notas: "Casa de 2 niveles, 4 habitaciones, necesita fotos profesionales.",
    creadoEn: conHora(-6),
    checklist: [
      { id: "chk0", nombre: "Escritura o título de propiedad", completado: true },
      { id: "chk1", nombre: "Fotografías de la propiedad", completado: false },
      { id: "chk2", nombre: "Recibo de agua o luz reciente", completado: true },
      { id: "chk3", nombre: "DUI del propietario", completado: true },
      { id: "chk4", nombre: "Solvencia municipal", completado: false },
    ],
  },
  {
    id: "cap2", contactoId: "c4", tipoInmueble: "apartamento", operacion: "alquiler", direccion: "Torre Futura, San Salvador",
    zona: "San Salvador", precio: 850, comisionPct: 8, estado: "aprobada", notas: "Amueblado, listo para publicar apenas confirme fecha de entrega.",
    creadoEn: conHora(-15),
    checklist: CHECKLIST_BASE.map((nombre, i) => ({ id: `chk${i}`, nombre, completado: true })),
  },
];
