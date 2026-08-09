import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { AppDataProvider, useAppData } from "./context/AppDataContext.jsx";
import { AppShell } from "./layouts/AppShell.jsx";
import { LoginScreen } from "./features/auth/LoginScreen.jsx";
import { Inicio } from "./features/inicio/Inicio.jsx";
import { Contactos } from "./features/contactos/Contactos.jsx";
import { CrearContactoModal } from "./features/contactos/CrearContactoModal.jsx";
import { DetalleContactoModal } from "./features/contactos/DetalleContactoModal.jsx";
import { Oportunidades } from "./features/oportunidades/Oportunidades.jsx";
import { CrearOportunidadModal } from "./features/oportunidades/CrearOportunidadModal.jsx";
import { Captacion } from "./features/captacion/Captacion.jsx";
import { CaptacionGuiada } from "./features/captacion/CaptacionGuiada.jsx";
import { Agenda } from "./features/agenda/Agenda.jsx";
import { CrearActividadModal } from "./features/agenda/CrearActividadModal.jsx";
import { ContactarModal } from "./components/shared/ContactarModal.jsx";

const VISTAS = {
  inicio: Inicio,
  contactos: Contactos,
  oportunidades: Oportunidades,
  captacion: Captacion,
  agenda: Agenda,
};

function VistaActiva() {
  const { vista } = useAppData();
  const Vista = VISTAS[vista] || Inicio;
  return vista === "inicio" ? <Vista /> : (
    <div className="px-4 py-6 lg:px-0 lg:py-0">
      <Vista />
    </div>
  );
}

function GlobalModals() {
  const {
    contactos, registrarContacto,
    crearContacto, crearContactoAbierto, setCrearContactoAbierto,
    crearOportunidad, crearOportunidadAbierto, setCrearOportunidadAbierto,
    crearCaptacion, crearCaptacionAbierto, setCrearCaptacionAbierto,
    crearActividad, crearActividadAbierto, setCrearActividadAbierto,
    contactarTipo, setContactarTipo,
  } = useAppData();

  return (
    <>
      <CrearContactoModal open={crearContactoAbierto} onClose={() => setCrearContactoAbierto(false)} onCrear={(d) => { crearContacto(d); setCrearContactoAbierto(false); }} />
      <CrearOportunidadModal open={crearOportunidadAbierto} onClose={() => setCrearOportunidadAbierto(false)} contactos={contactos} onCrear={(d) => { crearOportunidad(d); setCrearOportunidadAbierto(false); }} />
      <CaptacionGuiada open={crearCaptacionAbierto} onClose={() => setCrearCaptacionAbierto(false)} contactos={contactos} onCrear={(d) => { crearCaptacion(d); setCrearCaptacionAbierto(false); }} />
      <CrearActividadModal open={crearActividadAbierto} onClose={() => setCrearActividadAbierto(false)} contactos={contactos} onCrear={(d) => { crearActividad(d); setCrearActividadAbierto(false); }} />
      <ContactarModal tipo={contactarTipo} onClose={() => setContactarTipo(null)} contactos={contactos} onRegistrar={registrarContacto} />
      <DetalleContactoModal />
    </>
  );
}

function PantallaCargando() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-gold-400" />
    </div>
  );
}

function AppCargada() {
  const { cargando } = useAppData();
  if (cargando) return <PantallaCargando />;
  return (
    <>
      <AppShell>
        <VistaActiva />
      </AppShell>
      <GlobalModals />
    </>
  );
}

function AppAutenticada() {
  return (
    <AppDataProvider>
      <AppCargada />
    </AppDataProvider>
  );
}

function Gate() {
  const { cargando, session } = useAuth();
  if (cargando) return <PantallaCargando />;
  return session ? <AppAutenticada /> : <LoginScreen />;
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
