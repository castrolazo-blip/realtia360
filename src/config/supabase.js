// Credenciales públicas del proyecto Supabase de Realtia. La clave "anon" está diseñada
// para exponerse en el cliente (así funciona cualquier app de Supabase) — la seguridad
// real la dan las políticas de Row Level Security en la base de datos, no el secreto de
// esta clave. Se puede sobreescribir con variables de entorno VITE_SUPABASE_URL /
// VITE_SUPABASE_ANON_KEY si en el futuro se despliega contra otro proyecto.
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://jnkrrbbzghtdzylpjsgc.supabase.co";
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impua3JyYmJ6Z2h0ZHp5bHBqc2djIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcxNTYzOTMsImV4cCI6MjEwMjczMjM5M30.RO6IUCw6mKzGKUkFDqcEZgmU2qovyudJZ1U85R68EfE";
