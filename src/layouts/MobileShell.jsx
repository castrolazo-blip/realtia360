import { NAV_MOVIL } from "../config/nav.js";
import { useAppData } from "../context/AppDataContext.jsx";

// Shell de teléfono: barra inferior de pestañas grandes, estilo app nativa.
// Deliberadamente distinto del shell de escritorio (que usa un sidebar lateral fijo).
export function MobileShell({ children }) {
  const { vista, setVista } = useAppData();

  return (
    <div className="min-h-screen bg-gray-50 pb-[calc(4.75rem+env(safe-area-inset-bottom))] font-sans text-ink-900">
      {children}

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-ink-950/95 backdrop-blur pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.4)]">
        <div className="grid grid-cols-5">
          {NAV_MOVIL.map((item) => {
            const activo = vista === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setVista(item.key)}
                className="flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold tracking-tight transition"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-2xl transition ${
                    activo ? "bg-gold-500 text-ink-950" : "text-white/50"
                  }`}
                >
                  <item.icon className="h-[1.15rem] w-[1.15rem]" />
                </span>
                <span className={activo ? "text-gold-400" : "text-white/40"}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
