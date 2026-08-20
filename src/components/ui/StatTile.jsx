import { Card } from "./Card.jsx";

export function StatTile({ label, valor, icono: IconComp, destacado }) {
  return (
    <Card className={`p-5 ${destacado ? "border-gold-300 bg-gold-50/40" : ""}`}>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${destacado ? "bg-gold-500 text-ink-950" : "bg-brand-50 text-brand-700"}`}>
        <IconComp className="h-4 w-4" />
      </span>
      <p className="mt-3 font-display text-3xl font-semibold text-ink-950">{valor}</p>
      <p className="mt-0.5 text-xs font-medium text-black/45">{label}</p>
    </Card>
  );
}
