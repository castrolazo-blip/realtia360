import { PLANES } from "../../config/plans.js";
import { Icon } from "../icons/Icon.jsx";

const ESTILOS = {
  basic: "bg-white/10 text-white",
  gold: "bg-gold-500/90 text-ink-950",
  premium: "bg-gradient-to-r from-gold-500 to-gold-300 text-ink-950",
};

// Insignia de plan comercial (Basic / Gold / Premium). Hoy es solo presentación;
// el control de acceso real por plan se conecta en la Fase 2 (Supabase).
export function PlanBadge({ plan = "basic", className = "" }) {
  const meta = PLANES[plan] || PLANES.basic;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${ESTILOS[plan] || ESTILOS.basic} ${className}`}>
      {plan !== "basic" && <Icon.Crown className="h-3 w-3" />}
      {meta.nombre}
    </span>
  );
}
