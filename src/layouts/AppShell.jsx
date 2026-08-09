import { useIsDesktop } from "../hooks/useMediaQuery.js";
import { MobileShell } from "./MobileShell.jsx";
import { DesktopShell } from "./DesktopShell.jsx";

// Decide en JS (no solo con CSS) qué shell montar, para que el contenido se renderice
// una única vez: cada shell aporta un "chrome" de navegación deliberadamente distinto
// (barra inferior de app en móvil vs. sidebar + barra de búsqueda en escritorio) sin
// duplicar el árbol de componentes ni el estado de los modales que vive dentro.
export function AppShell({ children }) {
  const esEscritorio = useIsDesktop();
  return esEscritorio ? <DesktopShell>{children}</DesktopShell> : <MobileShell>{children}</MobileShell>;
}
