const variants = {
  primary: "bg-brand-700 text-white disabled:opacity-40",
  secondary: "border-2 border-gray-200 bg-white text-gray-700",
};

export function BotonGrande({ children, onClick, variant = "primary", disabled, className = "" }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-2xl py-4 text-lg font-bold transition active:scale-[0.98] disabled:active:scale-100 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
