export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-black/55">{label}</span>
      {children}
    </label>
  );
}

// text-base (16px) a propósito: en iOS Safari, un campo de texto con letra menor a 16px
// hace que el navegador haga zoom automático al enfocarlo, dejando la pantalla "movida"
// hasta que el usuario la arrastra de vuelta — con 16px ese zoom nunca se dispara.
export const inputClass =
  "w-full rounded-xl border border-black/10 bg-gray-50 px-3 py-2.5 text-base text-gray-900 outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/15";
