import { sql } from "drizzle-orm";
import { db } from "./client.js";
import { pool, waitForDb } from "./pool.js";
import { bookings, photographers } from "./schema.js";

const inDays = (days: number): Date => new Date(Date.now() + days * 86_400_000);

async function seed(): Promise<void> {
  await waitForDb();

  // Idempotent reset so re-running seed gives a clean, known dataset.
  await db.execute(sql`TRUNCATE bookings, photographers RESTART IDENTITY CASCADE`);

  const inserted = await db
    .insert(photographers)
    .values([
      { name: "Ana Gómez", city: "Bogotá", hourlyRate: 120, rating: "4.8" },
      { name: "Carlos Ruiz", city: "Bogotá", hourlyRate: 95, rating: "4.5" },
      { name: "Diana Castro", city: "Medellín", hourlyRate: 140, rating: "4.9" },
      { name: "Esteban Marín", city: "Medellín", hourlyRate: 80, rating: "4.2" },
      { name: "Felipe Ortega", city: "Cali", hourlyRate: 110, rating: "4.6" },
      { name: "Gabriela Lozano", city: "Cartagena", hourlyRate: 160, rating: "5.0" },
    ])
    .returning({ id: photographers.id });

  await db.insert(bookings).values([
    {
      photographerId: inserted[0]!.id,
      clientName: "Acme Corp",
      scheduledAt: inDays(2),
      status: "confirmed",
    },
    {
      photographerId: inserted[0]!.id,
      clientName: "Studio Bright",
      scheduledAt: inDays(5),
      status: "pending",
    },
    {
      photographerId: inserted[2]!.id,
      clientName: "Wedding Co",
      scheduledAt: inDays(1),
      status: "confirmed",
    },
  ]);

  console.log("✓ seed complete");
  await pool.end();
}

seed().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
