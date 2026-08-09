import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(undefined); // undefined = aún cargando, null = sin sesión
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nuevaSesion) => setSession(nuevaSesion));
    return () => subscription.subscription.unsubscribe();
  }, []);

  async function signIn(correo, contrasena) {
    setAuthError("");
    const { error } = await supabase.auth.signInWithPassword({ email: correo, password: contrasena });
    if (error) setAuthError(traducirError(error));
    return { ok: !error };
  }

  async function signUp(correo, contrasena, datosAgente) {
    setAuthError("");
    const { error } = await supabase.auth.signUp({
      email: correo,
      password: contrasena,
      options: { data: datosAgente }, // nombre_agente, nombre_oficina, ubicacion → los toma el trigger de Postgres
    });
    if (error) setAuthError(traducirError(error));
    return { ok: !error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = { session, usuario: session?.user || null, cargando: session === undefined, authError, setAuthError, signIn, signUp, signOut };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function traducirError(error) {
  const msg = error.message || "";
  if (msg.includes("Invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (msg.includes("User already registered")) return "Ya existe una cuenta con ese correo.";
  if (msg.includes("Password should be at least")) return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("Unable to validate email address")) return "El correo no es válido.";
  return msg || "Ocurrió un error inesperado.";
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
