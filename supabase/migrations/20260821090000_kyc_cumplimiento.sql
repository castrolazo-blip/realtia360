-- Módulo de Cumplimiento (KYC/AML) — expediente de verificación de identidad y riesgo por
-- contacto, con el mismo patrón de privacidad que el resto de la cartera: privado del
-- agente que lo hizo, visible en modo lectura para el Broker de la misma oficina.
create table public.realtia_kyc (
  id uuid primary key default gen_random_uuid(),
  agente_id uuid not null references auth.users(id) on delete cascade,
  contacto_id uuid not null references public.realtia_contactos(id) on delete cascade,
  oportunidad_id uuid references public.realtia_oportunidades(id) on delete set null,

  tipo_documento text,
  numero_documento text,
  ocupacion text,
  origen_fondos text,
  forma_pago text,
  monto_transaccion numeric,
  pais_alto_riesgo boolean not null default false,
  persona_expuesta_politicamente boolean not null default false,

  coincidencia_listas boolean not null default false,
  detalle_listas jsonb not null default '[]',
  verificado_en timestamptz,

  puntaje_riesgo integer,
  nivel_riesgo text check (nivel_riesgo in ('bajo', 'medio', 'alto')),

  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_revision', 'aprobado', 'rechazado')),
  notas text,
  created_at timestamptz not null default now()
);
create index realtia_kyc_agente_idx on public.realtia_kyc using btree (agente_id);
create index realtia_kyc_contacto_idx on public.realtia_kyc using btree (contacto_id);

alter table public.realtia_kyc enable row level security;

create policy realtia_kyc_select_own on public.realtia_kyc for select using (agente_id = auth.uid());
create policy realtia_kyc_insert_own on public.realtia_kyc for insert with check (agente_id = auth.uid());
create policy realtia_kyc_update_own on public.realtia_kyc for update using (agente_id = auth.uid());
create policy realtia_kyc_delete_own on public.realtia_kyc for delete using (agente_id = auth.uid());

-- El Broker puede leer (nunca editar) el cumplimiento de todo su equipo — igual que el
-- resto de la cartera de oficina, para poder actuar como responsable de cumplimiento.
create policy realtia_kyc_select_oficina_broker
  on public.realtia_kyc for select
  using (
    public.realtia_soy_broker()
    and exists (
      select 1 from public.realtia_perfiles p
      where p.id = realtia_kyc.agente_id and p.oficina_id = public.realtia_mi_oficina_id()
    )
  );
