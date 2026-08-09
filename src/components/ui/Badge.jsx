export function Badge({ children, className = "", icon }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className || "bg-black/5 text-black/60"}`}>
      {icon}
      {children}
    </span>
  );
}
