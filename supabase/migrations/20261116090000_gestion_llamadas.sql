-- Fase 1 de "Productividad": gestión diaria de llamadas (cola de prospección, resultado de
-- cada llamada, próxima acción automática) y privacidad "solo números" para el Broker.
--
-- 1. Contactos: estado de gestión (en qué va la prospección con esa persona) y objetivos
--    (qué quiere hacer: comprar, alquilar, vender, dar en alquiler). Es una dimensión
--    distinta de `clasificacion`, que describe la relación (círculo de influencia).
alter table public.realtia_contactos
  add column estado_gestion text not null default 'sin_gestion'
    check (estado_gestion in ('sin_gestion', 'nuevo', 'seguimiento', 'futuro', 'no_interesado', 'cerrado', 'no_contactar')),
  add column objetivos text[] not null default '{}',
  add column origen text,
  add column numero_incorrecto boolean not null default false,
  add column ultima_gestion timestamptz;

-- 2. Interacciones: una fila por llamada o WhatsApp, con su resultado. Es la base de los
--    indicadores (intentos, contactos efectivos, citas) — privada del agente.
create table public.realtia_interacciones (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  contacto_id uuid references public.realtia_contactos(id) on delete cascade,
  actividad_id uuid references public.realtia_actividades(id) on delete set null,
  canal text not null default 'llamada' check (canal in ('llamada', 'whatsapp')),
  resultado text not null,
  resultado_texto text,
  efectivo boolean not null default false,
  cita boolean not null default false,
  nota text,
  created_at timestamptz not null default now()
);
create index realtia_interacciones_agente_idx on public.realtia_interacciones using btree (agente_id, created_at desc);
create index realtia_interacciones_contacto_idx on public.realtia_interacciones using btree (contacto_id);

alter table public.realtia_interacciones enable row level security;
create policy realtia_interacciones_select_own on public.realtia_interacciones for select using (agente_id = auth.uid());
create policy realtia_interacciones_insert_own on public.realtia_interacciones for insert with check (agente_id = auth.uid());
create policy realtia_interacciones_update_own on public.realtia_interacciones for update using (agente_id = auth.uid());
create policy realtia_interacciones_delete_own on public.realtia_interacciones for delete using (agente_id = auth.uid());

-- 3. Privacidad "solo números": el Broker deja de poder leer la cartera de sus asesores
--    (nombres, teléfonos, notas, títulos de actividades). Las propiedades PUBLICADAS
--    siguen siendo inventario de toda la oficina (esa política no se toca).
drop policy if exists realtia_contactos_select_oficina_broker on public.realtia_contactos;
drop policy if exists realtia_oportunidades_select_oficina_broker on public.realtia_oportunidades;
drop policy if exists realtia_captaciones_select_oficina_broker on public.realtia_captaciones;
drop policy if exists realtia_actividades_select_oficina_broker on public.realtia_actividades;
drop policy if exists realtia_requerimientos_select_oficina_broker on public.realtia_requerimientos;
drop policy if exists realtia_kyc_select_oficina_broker on public.realtia_kyc;

-- En su lugar, una función que devuelve SOLO columnas numéricas o de estado, sin ningún
-- dato que identifique a un cliente. Solo responde si quien llama es Broker, y solo con
-- filas de su propia oficina.
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
      where i.agente_id in (select id from equipo) and i.created_at > now() - interval '120 days'), '[]'::jsonb)
  );
$$;

revoke execute on function public.realtia_metricas_oficina() from public, anon;
grant execute on function public.realtia_metricas_oficina() to authenticated;
