import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Resolve the shared package straight to its source so Vite transpiles the TS.
      "@snappr/shared": fileURLToPath(
        new URL("../shared/src/index.ts", import.meta.url),
      ),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the Express server, so the client uses same-origin /api.
      "/api": "http://localhost:3001",
    },
  },
});
