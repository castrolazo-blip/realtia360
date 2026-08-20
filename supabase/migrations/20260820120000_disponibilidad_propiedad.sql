-- Estado de disponibilidad de una propiedad publicada — dimensión separada del pipeline de
-- captación (borrador → … → publicada). Una propiedad "publicada" sigue existiendo en el
-- inventario de oficina aunque ya esté reservada, cerrada o retirada del mercado (igual que
-- las carpetas "Propiedades Cerradas" / "Reservadas" / "No Disponibles" del Drive de la
-- oficina, que se conservan como registro histórico, no se borran).
alter table public.realtia_captaciones
  add column disponibilidad text not null default 'disponible'
  check (disponibilidad in ('disponible', 'reservada', 'cerrada', 'no_disponible'));
