import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  // Read the monorepo-root .env (the "" prefix loads all vars, not just VITE_*).
  // These are used here in Node config only — they are NOT exposed to the browser.
  const repoRoot = fileURLToPath(new URL("../", import.meta.url));
  const env = loadEnv(mode, repoRoot, "");
  const clientPort = Number(env.CLIENT_PORT ?? 5173);
  const serverPort = Number(env.SERVER_PORT ?? 3001);

  return {
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
      port: clientPort,
      proxy: {
        // Forward API calls to the Express server — port derived from the same .env.
        "/api": `http://localhost:${serverPort}`,
      },
    },
  };
});
