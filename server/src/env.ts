import { config } from "dotenv";
import { fileURLToPath } from "node:url";

// pnpm runs scripts with the cwd set to the package dir, so a bare dotenv would
// miss the monorepo-root .env. Point it at the root explicitly, by absolute path.
config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

export const SERVER_PORT = Number(process.env.SERVER_PORT ?? 3001);
export const DATABASE_URL =
  process.env.DATABASE_URL ?? "postgres://snappr:snappr@localhost:5433/snappr";
