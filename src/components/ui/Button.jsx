const variants = {
  primary: "bg-brand-700 text-white shadow-sm hover:bg-brand-800",
  gold: "bg-gold-500 text-ink-950 shadow-sm hover:bg-gold-400",
  secondary: "bg-white text-brand-800 border border-brand-700/20 hover:bg-brand-50",
  ghost: "text-brand-800 hover:bg-brand-50",
  danger: "bg-rose-600 text-white hover:opacity-90",
};

export function Button({ children, onClick, variant = "primary", className = "", disabled, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
