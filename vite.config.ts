/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Vite 5 + Tailwind CSS v4 (targeted 2026-08; verify against
// https://vite.dev and https://tailwindcss.com/docs/installation/using-vite
// if either has moved on when you next touch this file).
// Test runner: Vitest 3 (2026-09) — https://vitest.dev/config/
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
    // Bind IPv4 loopback explicitly. Left to its default, Vite bound only
    // to IPv6 ([::1]) on this machine, so any browser that resolved
    // "localhost" to 127.0.0.1 first got ERR_CONNECTION_REFUSED while the
    // server was happily running. Loopback-only — not exposed to the LAN
    // (use `--host` on the CLI if you ever need that deliberately).
    host: "127.0.0.1",
    // Fail loudly instead of silently sliding to 5174 if the port is busy —
    // a "site can't be reached" on 5173 is otherwise very confusing.
    strictPort: true,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: false,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    restoreMocks: true,
  },
});
