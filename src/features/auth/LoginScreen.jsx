import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { Button, Field, inputClass } from "../../components/ui/index.js";

export function LoginScreen() {
  const { signIn, signUp, authError, setAuthError } = useAuth();
  const [modo, setModo] = useState("login"); // 'login' | 'signup'
  const [enviando, setEnviando] = useState(false);
  const [avisoConfirmacion, setAvisoConfirmacion] = useState(false);

  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [nombreAgente, setNombreAgente] = useState("");
  const [nombreOficina, setNombreOficina] = useState("");
  const [ubicacion, setUbicacion] = useState("");

  function cambiarModo(m) {
    setModo(m);
    setAuthError("");
    setAvisoConfirmacion(false);
  }

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setAvisoConfirmacion(false);
    if (modo === "login") {
      await signIn(correo, contrasena);
    } else {
      const res = await signUp(correo, contrasena, { nombre_agente: nombreAgente, nombre_oficina: nombreOficina, ubicacion });
      if (res.ok) setAvisoConfirmacion(true);
    }
    setEnviando(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 font-display text-2xl font-bold text-ink-950">
            R
          </div>
          <h1 className="font-display text-2xl font-semibold text-white">Realtia</h1>
          <p className="mt-1 text-sm text-white/50">Cartera, captación y agenda para agentes inmobiliarios</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-premium sm:p-8">
          <div className="mb-6 flex gap-1.5 rounded-full bg-gray-100 p-1">
            <button
              onClick={() => cambiarModo("login")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${modo === "login" ? "bg-white text-ink-950 shadow-sm" : "text-black/45"}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => cambiarModo("signup")}
              className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${modo === "signup" ? "bg-white text-ink-950 shadow-sm" : "text-black/45"}`}
            >
              Crear cuenta
            </button>
          </div>

          {avisoConfirmacion ? (
            <div className="rounded-2xl bg-brand-50 p-4 text-sm text-brand-800">
              Cuenta creada. Si tu proyecto pide confirmación por correo, revisa tu bandeja de entrada; si no, ya puedes iniciar sesión.
            </div>
          ) : (
            <form onSubmit={enviar} className="flex flex-col gap-4">
              {modo === "signup" && (
                <>
                  <Field label="Tu nombre *">
                    <input required className={inputClass} value={nombreAgente} onChange={(e) => setNombreAgente(e.target.value)} placeholder="Ej. Ana Beatriz Rivas" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Oficina / equipo">
                      <input className={inputClass} value={nombreOficina} onChange={(e) => setNombreOficina(e.target.value)} placeholder="Ej. Rivas Bienes Raíces" />
                    </Field>
                    <Field label="Ubicación">
                      <input className={inputClass} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ciudad, país" />
                    </Field>
                  </div>
                </>
              )}
              <Field label="Correo *">
                <input required type="email" autoComplete="email" className={inputClass} value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="tucorreo@ejemplo.com" />
              </Field>
              <Field label="Contraseña *">
                <input
                  required type="password" minLength={6}
                  autoComplete={modo === "login" ? "current-password" : "new-password"}
                  className={inputClass} value={contrasena} onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </Field>

              {authError && <p className="text-sm text-rose-600">{authError}</p>}

              <Button type="submit" disabled={enviando} className="mt-1 w-full !py-3">
                {enviando ? "Un momento…" : modo === "login" ? "Entrar" : "Crear mi cuenta"}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-white/30">Tus datos son privados: cada agente ve únicamente su propia cartera.</p>
      </div>
    </div>
  );
}
