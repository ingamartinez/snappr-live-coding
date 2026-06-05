import { drizzle } from "drizzle-orm/node-postgres";
import { pool } from "./pool.js";
import * as schema from "./schema.js";

// The Drizzle query builder, bound to the shared pg pool. Import `db` to query.
export const db = drizzle(pool, { schema });
