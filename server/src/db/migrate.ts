import { pool, waitForDb } from "./pool.js";

// Plain SQL migrations. No ORM on purpose — this is where you show you know SQL.
const SCHEMA = `
CREATE TABLE IF NOT EXISTS photographers (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  city        TEXT NOT NULL,
  hourly_rate INTEGER NOT NULL CHECK (hourly_rate >= 0),
  rating      NUMERIC(2, 1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id              SERIAL PRIMARY KEY,
  photographer_id INTEGER NOT NULL REFERENCES photographers(id) ON DELETE CASCADE,
  client_name     TEXT NOT NULL,
  scheduled_at    TIMESTAMPTZ NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_photographers_city ON photographers(city);
CREATE INDEX IF NOT EXISTS idx_bookings_photographer ON bookings(photographer_id);
`;

async function migrate(): Promise<void> {
  await waitForDb();
  await pool.query(SCHEMA);
  console.log("✓ migration applied");
  await pool.end();
}

migrate().catch((err) => {
  console.error("migration failed:", err);
  process.exit(1);
});
