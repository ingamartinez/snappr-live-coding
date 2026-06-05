import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit runs with cwd = server package dir; the .env lives at the repo root.
config({ path: "../.env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL ??
      "postgres://snappr:snappr@localhost:5433/snappr",
  },
});
