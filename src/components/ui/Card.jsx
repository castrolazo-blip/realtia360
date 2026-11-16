export function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-black/[0.06] bg-white shadow-card ${className}`}>{children}</div>;
}
