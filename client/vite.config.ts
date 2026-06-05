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
      // Bind all interfaces so the dev server is reachable over the Tailnet/LAN,
      // not just localhost. Fail loudly if the port is taken instead of bumping it.
      host: true,
      strictPort: true,
      // Vite rejects unknown Host headers (DNS-rebinding protection) once exposed
      // beyond localhost. A leading-dot entry allows a domain and all its subdomains —
      // here, every device on this Tailscale tailnet.
      allowedHosts: [".tailcabcc8.ts.net"],
      proxy: {
        // Forward API calls to the Express server. The proxy runs on this machine,
        // so `localhost` here is always the local backend — even for remote clients.
        "/api": `http://localhost:${serverPort}`,
      },
    },
  };
});
