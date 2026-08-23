import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Vite 5 + Tailwind CSS v4 (targeted 2026-08; verify against
// https://vite.dev and https://tailwindcss.com/docs/installation/using-vite
// if either has moved on when you next touch this file).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Keep the initial bundle lean for low-bandwidth rural users.
    // Route-level code splitting happens via React.lazy() in src/App.tsx;
    // Connect chat/voice widgets are lazy-loaded on top of that.
    target: "es2020",
    sourcemap: true,
  },
  server: {
    port: 5173,
  },
});
