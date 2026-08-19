-- Realtia: capa de oficina (rol de Broker + Office Pulse).
-- Agrega el concepto de oficina compartida entre agentes y un rol (asesor/broker) para
-- que el Broker pueda ver, en modo lectura, la cartera de todo su equipo sin que ningún
-- agente pueda ver ni modificar la cartera de otro agente que no sea su Broker.

create table if not exists public.realtia_oficinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz not null default now()
);

alter table public.realtia_oficinas enable row level security;

alter table public.realtia_perfiles
  add column if not exists oficina_id uuid references public.realtia_oficinas(id),
  add column if not exists rol text not null default 'asesor' check (rol in ('asesor', 'broker'));

-- Backfill: los perfiles existentes se agrupan por nombre de oficina (mismo criterio que
-- usará el trigger de alta más abajo). El primero en haberse registrado en cada oficina
-- queda como broker; el resto, como asesor.
with nuevas_oficinas as (
  insert into public.realtia_oficinas (nombre)
  select distinct p.nombre_oficina
  from public.realtia_perfiles p
  where p.oficina_id is null
  returning id, nombre
),
asignados as (
  update public.realtia_perfiles p
  set oficina_id = n.id
  from nuevas_oficinas n
  where p.oficina_id is null and p.nombre_oficina = n.nombre
  returning p.id, p.oficina_id, p.created_at
),
rankeados as (
  select id, row_number() over (partition by oficina_id order by created_at asc) as orden
  from asignados
)
update public.realtia_perfiles p
set rol = case when r.orden = 1 then 'broker' else 'asesor' end
from rankeados r
where p.id = r.id;

-- Funciones auxiliares (security definer) para las políticas de RLS de abajo: evitan que
-- una política sobre realtia_perfiles termine consultándose a sí misma de forma recursiva.
create or replace function public.realtia_mi_oficina_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select oficina_id from public.realtia_perfiles where id = auth.uid();
$$;

create or replace function public.realtia_soy_broker()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce((select rol = 'broker' from public.realtia_perfiles where id = auth.uid()), false);
$$;

-- Oficinas: cada agente puede ver únicamente el registro de su propia oficina.
create policy realtia_oficinas_select_propia
  on public.realtia_oficinas for select
  using (id = public.realtia_mi_oficina_id());

-- Perfiles: el Broker puede ver los perfiles de los agentes de su misma oficina, además
-- de su propio perfil (ya permitido por la política existente realtia_perfiles_select_own).
create policy realtia_perfiles_select_oficina_broker
  on public.realtia_perfiles for select
  using (
    public.realtia_soy_broker()
    and oficina_id = public.realtia_mi_oficina_id()
  );

-- Cartera (contactos, oportunidades, actividades, captaciones): el Broker puede leer
-- —solo lectura, nunca editar ni borrar— las filas de los agentes de su oficina.
create policy realtia_contactos_select_oficina_broker
  on public.realtia_contactos for select
  using (
    public.realtia_soy_broker()
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = realtia_contactos.agente_id and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );

create policy realtia_oportunidades_select_oficina_broker
  on public.realtia_oportunidades for select
  using (
    public.realtia_soy_broker()
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = realtia_oportunidades.agente_id and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );

create policy realtia_captaciones_select_oficina_broker
  on public.realtia_captaciones for select
  using (
    public.realtia_soy_broker()
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = realtia_captaciones.agente_id and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );

create policy realtia_actividades_select_oficina_broker
  on public.realtia_actividades for select
  using (
    public.realtia_soy_broker()
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = realtia_actividades.agente_id and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );

-- Alta de cuenta: une al agente a la oficina existente que coincida con el nombre que
-- escribió (sin distinguir mayúsculas/minúsculas), o crea una oficina nueva si es la
-- primera vez que se usa ese nombre. Quien crea la oficina queda como su Broker; quien se
-- suma después, como asesor. Es una heurística simple por nombre de oficina —todavía no
-- hay un flujo de invitación— pensada para esta fase de pruebas.
create or replace function public.realtia_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_oficina_nombre text;
  v_oficina_id uuid;
  v_rol text;
begin
  v_oficina_nombre := coalesce(new.raw_user_meta_data->>'nombre_oficina', 'Mi oficina');

  select id into v_oficina_id
  from public.realtia_oficinas
  where lower(nombre) = lower(v_oficina_nombre)
  limit 1;

  if v_oficina_id is null then
    insert into public.realtia_oficinas (nombre) values (v_oficina_nombre)
    returning id into v_oficina_id;
    v_rol := 'broker';
  else
    v_rol := 'asesor';
  end if;

  insert into public.realtia_perfiles (id, nombre_agente, nombre_oficina, ubicacion, telefono, oficina_id, rol)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre_agente', split_part(new.email, '@', 1)),
    v_oficina_nombre,
    coalesce(new.raw_user_meta_data->>'ubicacion', ''),
    coalesce(new.raw_user_meta_data->>'telefono', ''),
    v_oficina_id,
    v_rol
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;
