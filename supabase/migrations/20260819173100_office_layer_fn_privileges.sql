-- Las funciones auxiliares de RLS de la migración anterior no están pensadas para
-- llamarse directamente desde la API (RPC) sino solo desde dentro de las políticas; se
-- restringe su ejecución a agentes ya autenticados y se revoca de anon/public, siguiendo
-- el hallazgo del advisor de seguridad de Supabase tras aplicar esa migración.
revoke execute on function public.realtia_mi_oficina_id() from public;
revoke execute on function public.realtia_soy_broker() from public;
grant execute on function public.realtia_mi_oficina_id() to authenticated;
grant execute on function public.realtia_soy_broker() to authenticated;

-- El trigger de alta de cuenta tampoco debe invocarse por RPC directo; solo lo dispara
-- Supabase Auth internamente al crear el usuario (los triggers no necesitan EXECUTE
-- otorgado a un rol para dispararse).
revoke execute on function public.realtia_handle_new_user() from public, anon, authenticated;
