import { sql } from "drizzle-orm";
import { db } from "./client.js";
import { pool, waitForDb } from "./pool.js";
import { availabilitySlots, bookings, photographers } from "./schema.js";

const inDays = (days: number): Date => new Date(Date.now() + days * 86_400_000);

// The Monday (UTC) of the week containing `date`, as YYYY-MM-DD.
const mondayOf = (date: Date): string => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};

const addDays = (date: string, days: number): string => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

async function seed(): Promise<void> {
  await waitForDb();

  // Idempotent reset so re-running seed gives a clean, known dataset.
  await db.execute(
    sql`TRUNCATE availability_slots, bookings, photographers RESTART IDENTITY CASCADE`,
  );

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

  // Availability for the current week (Mon–Sun), so the calendar is populated.
  const monday = mondayOf(new Date());
  await db.insert(availabilitySlots).values([
    // Ana: split day Monday, full Wednesday, half Friday.
    { photographerId: inserted[0]!.id, date: monday, startTime: "09:00", endTime: "12:00" },
    { photographerId: inserted[0]!.id, date: monday, startTime: "14:00", endTime: "18:00" },
    { photographerId: inserted[0]!.id, date: addDays(monday, 2), startTime: "09:00", endTime: "17:00" },
    { photographerId: inserted[0]!.id, date: addDays(monday, 4), startTime: "10:00", endTime: "16:00" },
    // Diana: Tuesday morning, Thursday afternoon.
    { photographerId: inserted[2]!.id, date: addDays(monday, 1), startTime: "08:00", endTime: "12:00" },
    { photographerId: inserted[2]!.id, date: addDays(monday, 3), startTime: "13:00", endTime: "19:00" },
  ]);

  console.log("✓ seed complete");
  await pool.end();
}

seed().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
