import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relativo (no absoluto) para que el build funcione igual servido desde la raíz de un
  // dominio (Vercel) o desde un subdirectorio de proyecto (GitHub Pages: /realtia360/).
  base: "./",
  plugins: [react()],
});
