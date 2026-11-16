-- Fotos de las propiedades (galería en la ficha). Cada captación guarda la lista ordenada
-- de sus fotos; la primera es la portada.
alter table public.realtia_captaciones
  add column fotos jsonb not null default '[]';

-- Bucket público de lectura: son fotos para comercializar la propiedad, se muestran con un
-- <img> normal. La ruta lleva el id del agente y de la captación con un nombre aleatorio,
-- así que no se pueden adivinar ni listar. Solo se aceptan imágenes de hasta 5 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('realtia-fotos', 'realtia-fotos', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Escritura: cada agente sube, cambia y borra únicamente dentro de su propia carpeta
-- (<agente_id>/<captacion_id>/<archivo>).
create policy realtia_fotos_insert_own on storage.objects for insert to authenticated
  with check (bucket_id = 'realtia-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy realtia_fotos_update_own on storage.objects for update to authenticated
  using (bucket_id = 'realtia-fotos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy realtia_fotos_delete_own on storage.objects for delete to authenticated
  using (bucket_id = 'realtia-fotos' and (storage.foldername(name))[1] = auth.uid()::text);

-- El directorio de la oficina suma el teléfono del asesor: la ficha de una propiedad
-- muestra al asesor responsable con botones de WhatsApp y llamada para sus compañeros.
drop function if exists public.realtia_directorio_oficina();
create function public.realtia_directorio_oficina()
returns table (id uuid, nombre_agente text, rol text, telefono text)
language sql
security definer
stable
set search_path = public
as $$
  select p.id, p.nombre_agente, p.rol, p.telefono
  from public.realtia_perfiles p
  where public.realtia_mi_oficina_id() is not null
    and p.oficina_id = public.realtia_mi_oficina_id();
$$;

revoke execute on function public.realtia_directorio_oficina() from public, anon;
grant execute on function public.realtia_directorio_oficina() to authenticated;
