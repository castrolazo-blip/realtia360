-- Propiedades (inventario compartido de oficina) y Requerimientos (lo que busca un
-- comprador), con matching básico entre ambos.
--
-- Principio de privacidad: una propiedad PUBLICADA (estado = 'publicada') es inventario de
-- toda la oficina — cualquier agente de la misma oficina puede verla (no solo el Broker),
-- porque necesita poder ofrecerla a sus propios compradores. El resto del pipeline de
-- captación (borrador, entrevista, documentos, etc.) sigue siendo privado del agente que
-- la está trabajando, igual que antes. Los requerimientos de compradores son siempre
-- privados del agente (nadie más necesita ver la cartera de compradores de un colega para
-- que el matching funcione — el match se calcula del lado del propio agente, contra el
-- inventario ya público de la oficina).

create table public.realtia_requerimientos (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  contacto_id uuid references public.realtia_contactos(id) on delete set null,
  tipo_inmueble text,
  operacion text not null default 'venta',
  zona text,
  precio_min numeric,
  precio_max numeric,
  notas text,
  estado text not null default 'activo' check (estado in ('activo', 'pausado', 'cerrado')),
  created_at timestamptz not null default now()
);
create index realtia_requerimientos_agente_idx on public.realtia_requerimientos using btree (agente_id);

alter table public.realtia_requerimientos enable row level security;

create policy realtia_requerimientos_select_own on public.realtia_requerimientos for select using (agente_id = auth.uid());
create policy realtia_requerimientos_insert_own on public.realtia_requerimientos for insert with check (agente_id = auth.uid());
create policy realtia_requerimientos_update_own on public.realtia_requerimientos for update using (agente_id = auth.uid());
create policy realtia_requerimientos_delete_own on public.realtia_requerimientos for delete using (agente_id = auth.uid());

-- El Broker también puede leer los requerimientos del equipo (mismo patrón que el resto
-- de la cartera).
create policy realtia_requerimientos_select_oficina_broker
  on public.realtia_requerimientos for select
  using (
    public.realtia_soy_broker()
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = realtia_requerimientos.agente_id and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );

-- Propiedades publicadas: visibles para cualquier agente de la misma oficina (no solo el
-- Broker) — es el inventario compartido, no cartera personal.
create policy realtia_captaciones_select_oficina_publicada
  on public.realtia_captaciones for select
  using (
    estado = 'publicada'
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = realtia_captaciones.agente_id and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );

-- Directorio de la oficina: solo id/nombre/rol de los compañeros, nunca teléfono, meta
-- anual ni comisión (eso sigue siendo privado del agente o visible solo para el Broker vía
-- la política existente sobre realtia_perfiles). Necesario para poder mostrar "Asesor: N"
-- en una propiedad publicada de un compañero sin exponer el resto de su perfil.
create or replace function public.realtia_directorio_oficina()
returns table (id uuid, nombre_agente text, rol text)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.nombre_agente, p.rol
  from public.realtia_perfiles p
  where public.realtia_mi_oficina_id() is not null
    and p.oficina_id = public.realtia_mi_oficina_id();
$$;

revoke execute on function public.realtia_directorio_oficina() from public, anon;
grant execute on function public.realtia_directorio_oficina() to authenticated;
