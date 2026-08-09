export function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-ink-900/5 bg-white shadow-card ${className}`}>{children}</div>;
}
