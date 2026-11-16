// El círculo virtuoso del asesor: 4 etapas en anillo, cada una se toca para ir a su
// módulo. Una etapa en cero se ve vacía y parpadea suave: "lo que está vacío, no produce".
const COLORES = [
  ["#9c7024", "#dcb75c"], // 1. Búsqueda — dorado
  ["#0a4735", "#157a58"], // 2. Captación — verde de marca
  ["#222f40", "#4f6685"], // 3. Negociación — tinta
  ["#8a1538", "#d23a5f"], // 4. Cierre — vino
];

const R1 = 192, r1 = 86, RM = (R1 + r1) / 2, HUECO = 2.2, PUNTA = 9, GIRO = -8;
const INICIOS = [180, 270, 0, 90];
// Corrimiento horizontal del texto para que no choque con el centro ni con el borde.
const AJUSTE_X = [6, 0, 16, 0];
const pol = (rad, deg) => {
  const a = ((deg + GIRO) * Math.PI) / 180;
  return [200 + rad * Math.cos(a), 200 + rad * Math.sin(a)];
};
const p = (rad, deg) => pol(rad, deg).map((n) => n.toFixed(1)).join(",");

export function CirculoVirtuoso({ etapas, onEtapa, onCentro }) {
  const vacias = etapas.filter((e) => e.total === 0).length;

  return (
    <div className="mx-auto w-full max-w-[420px]">
      <svg viewBox="-6 -6 412 412" className="h-auto w-full select-none" role="group" aria-label="Círculo virtuoso">
        <defs>
          {COLORES.map((c, i) => (
            <linearGradient key={i} id={`cv-g${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor={c[0]} />
              <stop offset="1" stopColor={c[1]} />
            </linearGradient>
          ))}
        </defs>

        {etapas.map((e, i) => {
          const a0 = INICIOS[i] + HUECO;
          const a1 = INICIOS[i] + 90 - HUECO;
          const d = `M${p(R1, a0)} A${R1},${R1} 0 0 1 ${p(R1, a1)} L${p(RM, a1 + PUNTA)} L${p(r1, a1)} A${r1},${r1} 0 0 0 ${p(r1, a0)} L${p(RM, a0 + PUNTA)} Z`;
          const [x0, cy] = pol(RM + 2, INICIOS[i] + 50 + PUNTA / 3);
          const cx = x0 + AJUSTE_X[i];
          const vacia = e.total === 0;
          const texto = vacia ? "#5b6472" : "#ffffff";
          return (
            <g
              key={e.key}
              role="button"
              tabIndex={0}
              aria-label={`${e.numero}. ${e.titulo}: ${e.total}${vacia ? ", vacía" : ""}`}
              onClick={() => onEtapa?.(e.key)}
              onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && onEtapa?.(e.key)}
              className="cursor-pointer outline-none transition-opacity hover:opacity-90 focus-visible:opacity-80"
            >
              <path
                d={d}
                fill={vacia ? "#eef0f3" : `url(#cv-g${i})`}
                stroke={vacia ? COLORES[i][0] : "none"}
                strokeWidth={vacia ? 2 : 0}
                strokeDasharray={vacia ? "6 5" : undefined}
                className={vacia ? "animate-pulse" : ""}
              />
              <text x={cx} y={cy - 28} textAnchor="middle" fill={texto} fontSize="11" fontWeight="700">
                <tspan fontSize="16">{e.numero}.</tspan> {e.titulo.toUpperCase()}
              </text>
              {vacia ? (
                <>
                  <text x={cx} y={cy + 6} textAnchor="middle" fill={COLORES[i][0]} fontSize="24" fontWeight="800">VACÍO</text>
                  <text x={cx} y={cy + 25} textAnchor="middle" fill={texto} fontSize="12" fontWeight="600">Toca para llenar</text>
                </>
              ) : (
                <>
                  <text x={cx} y={cy + 10} textAnchor="middle" fill={texto} fontSize="38" fontWeight="800">{e.total}</text>
                  {e.detalle.map((t, k) => (
                    <text key={k} x={cx} y={cy + 29 + k * 15} textAnchor="middle" fill={texto} fontSize="11.5" fontWeight="600">{t}</text>
                  ))}
                </>
              )}
            </g>
          );
        })}

        <g role="button" tabIndex={0} aria-label="Iniciar prospección" onClick={onCentro} onKeyDown={(ev) => (ev.key === "Enter" || ev.key === " ") && onCentro?.()} className="cursor-pointer outline-none">
          <circle cx="200" cy="200" r="78" fill="#0a0f14" />
          <text x="200" y="176" textAnchor="middle" fill="#dcb75c" fontSize="18" fontWeight="800">LO QUE</text>
          <text x="200" y="197" textAnchor="middle" fill="#dcb75c" fontSize="18" fontWeight="800">ESTÁ VACÍO,</text>
          <text x="200" y="218" textAnchor="middle" fill="#dcb75c" fontSize="18" fontWeight="800">NO PRODUCE</text>
          <text x="200" y="242" textAnchor="middle" fill={vacias ? "#fb7185" : "#63bc9b"} fontSize="13" fontWeight="700">
            {vacias ? `${vacias} ${vacias === 1 ? "etapa vacía" : "etapas vacías"}` : "Ciclo completo ✓"}
          </text>
        </g>
      </svg>
      <p className="mt-1 text-center text-xs text-black/45">Toca una etapa para trabajarla. Toca el centro para prospectar.</p>
    </div>
  );
}
