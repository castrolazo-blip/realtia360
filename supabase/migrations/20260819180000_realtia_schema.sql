-- Esquema completo de Realtia — proyecto de Supabase propio (ya no compartido con
-- sport-car-system). Crea desde cero las mismas tablas, políticas de RLS y funciones que
-- existían en el proyecto compartido (con el rol de Broker / Office Pulse ya incluido),
-- para que este archivo sirva como línea base reproducible del proyecto nuevo.

create table public.realtia_oficinas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  created_at timestamptz not null default now()
);

create table public.realtia_perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_agente text not null default 'Agente',
  nombre_oficina text not null default 'Mi oficina',
  ubicacion text not null default '',
  plan text not null default 'basic' check (plan in ('basic', 'gold', 'premium')),
  telefono text,
  meta_anual numeric,
  comision_promedio_pct numeric,
  precio_promedio_venta numeric,
  oficina_id uuid references public.realtia_oficinas(id),
  rol text not null default 'asesor' check (rol in ('asesor', 'broker')),
  created_at timestamptz not null default now()
);

create table public.realtia_contactos (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null,
  empresa text,
  ciudad text,
  clasificacion text not null default 'contacto_relacion',
  telefono text,
  correo text,
  circulo text,
  cercania text,
  profesion text,
  cumpleanos text,
  ultimo_contacto timestamptz,
  potencial_referidos text,
  valor_estrategico text not null default 'estandar',
  intereses text,
  notas jsonb not null default '[]',
  created_at timestamptz not null default now()
);
create index realtia_contactos_agente_idx on public.realtia_contactos using btree (agente_id);

create table public.realtia_oportunidades (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  contacto_id uuid references public.realtia_contactos(id) on delete set null,
  tipo text not null,
  etapa text not null default 'nueva',
  estado text not null default 'activa',
  valor numeric,
  zona text,
  proxima_accion text,
  proxima_fecha timestamptz,
  motivo_cierre text,
  created_at timestamptz not null default now(),
  cerrada_en timestamptz
);
create index realtia_oportunidades_agente_idx on public.realtia_oportunidades using btree (agente_id);

create table public.realtia_actividades (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  contacto_id uuid references public.realtia_contactos(id) on delete set null,
  oportunidad_id uuid references public.realtia_oportunidades(id) on delete set null,
  tipo text not null,
  titulo text not null,
  fecha_hora timestamptz not null,
  estado text not null default 'pendiente',
  duracion integer,
  resultado text,
  created_at timestamptz not null default now()
);
create index realtia_actividades_agente_idx on public.realtia_actividades using btree (agente_id);

create table public.realtia_captaciones (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  contacto_id uuid references public.realtia_contactos(id) on delete set null,
  tipo_inmueble text not null,
  operacion text not null default 'venta',
  direccion text,
  zona text,
  precio numeric,
  comision_pct numeric,
  estado text not null default 'borrador',
  notas text,
  area_terreno numeric,
  unidad_terreno text default 'varas2',
  area_construccion numeric,
  antiguedad integer,
  remodelada boolean not null default false,
  amueblada boolean not null default false,
  checklist jsonb not null default '[]',
  diagnostico jsonb not null default '[]',
  espacios jsonb not null default '[]',
  acm jsonb,
  descripcion_ia text,
  created_at timestamptz not null default now()
);
create index realtia_captaciones_agente_idx on public.realtia_captaciones using btree (agente_id);

alter table public.realtia_oficinas enable row level security;
alter table public.realtia_perfiles enable row level security;
alter table public.realtia_contactos enable row level security;
alter table public.realtia_oportunidades enable row level security;
alter table public.realtia_actividades enable row level security;
alter table public.realtia_captaciones enable row level security;

-- Perfiles: cada agente ve, crea y actualiza únicamente su propio perfil.
create policy realtia_perfiles_select_own on public.realtia_perfiles for select using (id = auth.uid());
create policy realtia_perfiles_insert_own on public.realtia_perfiles for insert with check (id = auth.uid());
create policy realtia_perfiles_update_own on public.realtia_perfiles for update using (id = auth.uid());

-- Contactos / oportunidades / actividades / captaciones: cada agente lee, crea, actualiza
-- y borra únicamente sus propias filas.
create policy realtia_contactos_select_own on public.realtia_contactos for select using (agente_id = auth.uid());
create policy realtia_contactos_insert_own on public.realtia_contactos for insert with check (agente_id = auth.uid());
create policy realtia_contactos_update_own on public.realtia_contactos for update using (agente_id = auth.uid());
create policy realtia_contactos_delete_own on public.realtia_contactos for delete using (agente_id = auth.uid());

create policy realtia_oportunidades_select_own on public.realtia_oportunidades for select using (agente_id = auth.uid());
create policy realtia_oportunidades_insert_own on public.realtia_oportunidades for insert with check (agente_id = auth.uid());
create policy realtia_oportunidades_update_own on public.realtia_oportunidades for update using (agente_id = auth.uid());
create policy realtia_oportunidades_delete_own on public.realtia_oportunidades for delete using (agente_id = auth.uid());

create policy realtia_actividades_select_own on public.realtia_actividades for select using (agente_id = auth.uid());
create policy realtia_actividades_insert_own on public.realtia_actividades for insert with check (agente_id = auth.uid());
create policy realtia_actividades_update_own on public.realtia_actividades for update using (agente_id = auth.uid());
create policy realtia_actividades_delete_own on public.realtia_actividades for delete using (agente_id = auth.uid());

create policy realtia_captaciones_select_own on public.realtia_captaciones for select using (agente_id = auth.uid());
create policy realtia_captaciones_insert_own on public.realtia_captaciones for insert with check (agente_id = auth.uid());
create policy realtia_captaciones_update_own on public.realtia_captaciones for update using (agente_id = auth.uid());
create policy realtia_captaciones_delete_own on public.realtia_captaciones for delete using (agente_id = auth.uid());

-- Funciones auxiliares (security definer) para las políticas de Broker de abajo: evitan
-- que una política sobre realtia_perfiles termine consultándose a sí misma de forma
-- recursiva. No están pensadas para llamarse por RPC directo (ver revoke al final).
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

-- Perfiles: el Broker puede ver además los perfiles de los agentes de su misma oficina.
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

-- Alta de cuenta: crea el perfil del agente al registrarse y lo une a la oficina existente
-- que coincida con el nombre que escribió (sin distinguir mayúsculas/minúsculas), o crea
-- una oficina nueva si es la primera vez que se usa ese nombre. Quien crea la oficina queda
-- como su Broker; quien se suma después, como asesor. Heurística simple por nombre de
-- oficina —todavía no hay un flujo de invitación— pensada para esta fase de pruebas.
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

create trigger realtia_on_auth_user_created
  after insert on auth.users
  for each row execute function public.realtia_handle_new_user();

-- Estas funciones auxiliares no están pensadas para llamarse directamente desde la API
-- (RPC), solo desde dentro de las políticas de arriba y del trigger. Se revoca también de
-- "anon" de forma explícita: Supabase otorga EXECUTE a anon/authenticated por privilegios
-- por defecto al crear una función, no solo vía el rol PUBLIC, así que "revoke ... from
-- public" por sí solo no alcanza para quitárselo a anon.
revoke execute on function public.realtia_mi_oficina_id() from public, anon;
revoke execute on function public.realtia_soy_broker() from public, anon;
grant execute on function public.realtia_mi_oficina_id() to authenticated;
grant execute on function public.realtia_soy_broker() to authenticated;
revoke execute on function public.realtia_handle_new_user() from public, anon, authenticated;
