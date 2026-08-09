/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        display: ["'Fraunces'", "ui-serif", "Georgia", "serif"],
      },
      colors: {
        ink: {
          950: "#0a0f14",
          900: "#101720",
          800: "#182230",
          700: "#222f40",
          600: "#324259",
        },
        brand: {
          50: "#eaf6f1",
          100: "#cdeadf",
          200: "#9ad4bd",
          300: "#63bc9b",
          500: "#157a58",
          600: "#0f6b4c",
          700: "#0c5941",
          800: "#0a4735",
          900: "#08362a",
        },
        gold: {
          50: "#faf5e8",
          100: "#f2e3bc",
          200: "#e8cd88",
          300: "#dcb75c",
          400: "#cda23f",
          500: "#b8872b",
          600: "#9c7024",
          700: "#7d591d",
        },
      },
      boxShadow: {
        premium: "0 20px 45px -20px rgba(10, 15, 20, 0.35)",
        card: "0 1px 2px rgba(10,15,20,0.04), 0 8px 24px -12px rgba(10,15,20,0.10)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
