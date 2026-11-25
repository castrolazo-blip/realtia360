-- Plan de negocio anual del asesor: la puerta de entrada de Realtia. Todo lo demás (metas
-- del día, cola de llamadas, círculo virtuoso, Coach) se calcula a partir de lo que el
-- asesor escribe aquí. Uno por asesor y por año; privado del asesor.
create table public.realtia_planes (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  anio integer not null,
  compromiso_en timestamptz,
  vision text,
  mision text,
  valores text[] not null default '{}',
  por_que text,
  logros jsonb not null default '{}',          -- {negocio, financiero, personal, familia, espiritual}
  metas jsonb not null default '{}',           -- mismas 5 áreas, para el año del plan
  meta_monetaria numeric,
  comision_promedio numeric,                   -- US$ que gana en promedio por transacción
  conversion jsonb not null default '{"efectivos": 0.4, "citas": 0.3, "cierres": 0.1}',
  clientes_potenciales uuid[] not null default '{}',
  paso integer not null default 0,             -- para retomar el asistente donde se quedó
  completado_en timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agente_id, anio)
);

alter table public.realtia_planes enable row level security;
create policy realtia_planes_select_own on public.realtia_planes for select using (agente_id = auth.uid());
create policy realtia_planes_insert_own on public.realtia_planes for insert with check (agente_id = auth.uid());
create policy realtia_planes_update_own on public.realtia_planes for update using (agente_id = auth.uid());
create policy realtia_planes_delete_own on public.realtia_planes for delete using (agente_id = auth.uid());

-- Métricas de oficina para el Broker: se suman los planes, SOLO en números (año, si está
-- completo, meta y comisión promedio). Visión, valores, logros y metas personales,
-- familiares o espirituales nunca salen de la cuenta del asesor.
create or replace function public.realtia_metricas_oficina()
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  with equipo as (
    select p.id from public.realtia_perfiles p
    where public.realtia_soy_broker()
      and p.oficina_id = public.realtia_mi_oficina_id()
  )
  select jsonb_build_object(
    'contactos', coalesce((select jsonb_agg(jsonb_build_object(
        'agente_id', c.agente_id, 'estado_gestion', c.estado_gestion, 'objetivos', c.objetivos, 'created_at', c.created_at))
      from public.realtia_contactos c where c.agente_id in (select id from equipo)), '[]'::jsonb),
    'oportunidades', coalesce((select jsonb_agg(jsonb_build_object(
        'agente_id', o.agente_id, 'tipo', o.tipo, 'etapa', o.etapa, 'estado', o.estado, 'valor', o.valor,
        'created_at', o.created_at, 'cerrada_en', o.cerrada_en))
      from public.realtia_oportunidades o where o.agente_id in (select id from equipo)), '[]'::jsonb),
    'captaciones', coalesce((select jsonb_agg(jsonb_build_object(
        'agente_id', k.agente_id, 'estado', k.estado, 'precio', k.precio, 'comision_pct', k.comision_pct, 'created_at', k.created_at))
      from public.realtia_captaciones k where k.agente_id in (select id from equipo)), '[]'::jsonb),
    'actividades', coalesce((select jsonb_agg(jsonb_build_object(
        'agente_id', a.agente_id, 'tipo', a.tipo, 'estado', a.estado, 'fecha_hora', a.fecha_hora))
      from public.realtia_actividades a where a.agente_id in (select id from equipo)), '[]'::jsonb),
    'kyc', coalesce((select jsonb_agg(jsonb_build_object(
        'agente_id', y.agente_id, 'nivel_riesgo', y.nivel_riesgo, 'estado', y.estado, 'coincidencia_listas', y.coincidencia_listas, 'created_at', y.created_at))
      from public.realtia_kyc y where y.agente_id in (select id from equipo)), '[]'::jsonb),
    'interacciones', coalesce((select jsonb_agg(jsonb_build_object(
        'agente_id', i.agente_id, 'canal', i.canal, 'resultado', i.resultado, 'efectivo', i.efectivo, 'cita', i.cita, 'created_at', i.created_at))
      from public.realtia_interacciones i
      where i.agente_id in (select id from equipo) and i.created_at > now() - interval '120 days'), '[]'::jsonb),
    'planes', coalesce((select jsonb_agg(jsonb_build_object(
        'agente_id', pl.agente_id, 'anio', pl.anio, 'completado', pl.completado_en is not null,
        'meta_monetaria', pl.meta_monetaria, 'comision_promedio', pl.comision_promedio))
      from public.realtia_planes pl where pl.agente_id in (select id from equipo)), '[]'::jsonb)
  );
$$;

revoke execute on function public.realtia_metricas_oficina() from public, anon;
grant execute on function public.realtia_metricas_oficina() to authenticated;

-- (25 nov 2026) El plan deja de pedir nombres de clientes: en su lugar define cómo se le
-- dará seguimiento (revisión semanal/mensual e indicadores) y cómo se ordena la agenda
-- (bloques fijos por día). `clientes_potenciales` queda sin uso.
alter table public.realtia_planes
  add column if not exists seguimiento jsonb not null default '{}',
  add column if not exists agenda jsonb not null default '{}';
