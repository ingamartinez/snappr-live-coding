import { pool, waitForDb } from "./pool.js";

async function seed(): Promise<void> {
  await waitForDb();

  // Idempotent reset so re-running seed gives a clean, known dataset.
  await pool.query("TRUNCATE bookings, photographers RESTART IDENTITY CASCADE");

  await pool.query(`
    INSERT INTO photographers (name, city, hourly_rate, rating) VALUES
      ('Ana Gómez',       'Bogotá',    120, 4.8),
      ('Carlos Ruiz',     'Bogotá',     95, 4.5),
      ('Diana Castro',    'Medellín',  140, 4.9),
      ('Esteban Marín',   'Medellín',   80, 4.2),
      ('Felipe Ortega',   'Cali',      110, 4.6),
      ('Gabriela Lozano', 'Cartagena', 160, 5.0)
  `);

  await pool.query(`
    INSERT INTO bookings (photographer_id, client_name, scheduled_at, status) VALUES
      (1, 'Acme Corp',     now() + interval '2 days', 'confirmed'),
      (1, 'Studio Bright', now() + interval '5 days', 'pending'),
      (3, 'Wedding Co',    now() + interval '1 day',  'confirmed')
  `);

  console.log("✓ seed complete");
  await pool.end();
}

seed().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
