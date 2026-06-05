import { Pool } from "pg";
import { DATABASE_URL } from "../env.js";

// One shared pool for the whole process. Import `pool` anywhere you need to query.
export const pool = new Pool({ connectionString: DATABASE_URL });

// Wait for Postgres to accept connections — useful right after `docker compose up`,
// when the container is up but the server inside is still booting.
export async function waitForDb(retries = 15, delayMs = 1000): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await pool.query("SELECT 1");
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}
