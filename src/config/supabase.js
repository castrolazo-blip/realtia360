// Credenciales públicas del proyecto Supabase de Realtia. La clave "anon" está diseñada
// para exponerse en el cliente (así funciona cualquier app de Supabase) — la seguridad
// real la dan las políticas de Row Level Security en la base de datos, no el secreto de
// esta clave. Se puede sobreescribir con variables de entorno VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY si en el futuro se despliega contra otro proyecto.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ivvjbuhppuwpgefwqpuz.supabase.co";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2dmpidWhwcHV3cGdlZndxcHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNzIwOTAsImV4cCI6MjA5Mzk0ODA5MH0.ObIayaz6b5dMVwkC5fiMMpmuDODGN1KPPCXgslLlp4c";
