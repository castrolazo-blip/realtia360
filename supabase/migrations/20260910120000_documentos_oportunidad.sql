-- Módulo de Documentos — el expediente documental de cada Oportunidad (checklist +
-- archivos), para que el asesor deje de llevar esto aparte en Drive. Mismo patrón de
-- privacidad que el resto de la cartera: privado del agente dueño de la oportunidad,
-- visible en modo lectura para el Broker de la misma oficina.
--
-- Fase 1 (este archivo): expediente, checklist de documentos requeridos por tipo de
-- operación y subida/almacenamiento de archivos. El auto-llenado de los contratos
-- (Acuerdo de Exclusiva, Acuerdo de Promoción, Ficha de Conocimiento a tu Cliente) queda
-- para una fase 2, una vez existan las plantillas reales de RE/MAX Expansion — por ahora
-- el checklist solo trae el tipo de documento como catálogo (ver
-- src/constants/documentos.js), sin generar el documento en sí.
create table public.realtia_documentos (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  oportunidad_id uuid not null references public.realtia_oportunidades(id) on delete cascade,

  tipo text not null,
  nombre text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'subido', 'aprobado', 'rechazado')),
  archivo_path text,
  archivo_nombre text,
  notas text,

  created_at timestamptz not null default now()
);
create index realtia_documentos_agente_idx on public.realtia_documentos using btree (agente_id);
create index realtia_documentos_oportunidad_idx on public.realtia_documentos using btree (oportunidad_id);

alter table public.realtia_documentos enable row level security;

create policy realtia_documentos_select_own on public.realtia_documentos for select using (agente_id = auth.uid());
create policy realtia_documentos_insert_own on public.realtia_documentos for insert with check (agente_id = auth.uid());
create policy realtia_documentos_update_own on public.realtia_documentos for update using (agente_id = auth.uid());
create policy realtia_documentos_delete_own on public.realtia_documentos for delete using (agente_id = auth.uid());

-- El Broker puede leer (nunca editar) los documentos de todo su equipo — igual que el
-- resto de la cartera de oficina.
create policy realtia_documentos_select_oficina_broker
  on public.realtia_documentos for select
  using (
    public.realtia_soy_broker()
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = realtia_documentos.agente_id and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );

-- Bucket privado para los archivos. Convención de ruta:
-- {agente_id}/{oportunidad_id}/{documento_id}-{nombre_archivo} — la primera carpeta es
-- siempre el agente_id, así las políticas de storage.objects pueden validar dueño sin
-- tocar la tabla realtia_documentos.
insert into storage.buckets (id, name, public)
values ('realtia-documentos', 'realtia-documentos', false)
on conflict (id) do nothing;

create policy realtia_documentos_storage_select_own
  on storage.objects for select
  using (bucket_id = 'realtia-documentos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy realtia_documentos_storage_insert_own
  on storage.objects for insert
  with check (bucket_id = 'realtia-documentos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy realtia_documentos_storage_update_own
  on storage.objects for update
  using (bucket_id = 'realtia-documentos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy realtia_documentos_storage_delete_own
  on storage.objects for delete
  using (bucket_id = 'realtia-documentos' and (storage.foldername(name))[1] = auth.uid()::text);

-- Broker: solo lectura de los archivos de su oficina (mismo alcance que la fila en
-- realtia_documentos).
create policy realtia_documentos_storage_select_oficina_broker
  on storage.objects for select
  using (
    bucket_id = 'realtia-documentos'
    and public.realtia_soy_broker()
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = ((storage.foldername(name))[1])::uuid
        and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );
