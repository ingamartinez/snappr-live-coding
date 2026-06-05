import type { Photographer } from "@snappr/shared";
import { desc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { photographers } from "../db/schema.js";

// Map a typed DB row to the camelCase shared contract (rating is numeric -> string).
function toPhotographer(row: typeof photographers.$inferSelect): Photographer {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    hourlyRate: row.hourlyRate,
    rating: Number(row.rating),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listPhotographers(city?: string): Promise<Photographer[]> {
  const rows = await db
    .select()
    .from(photographers)
    // Passing undefined to where() means "no filter" — Drizzle ignores it.
    .where(city ? eq(photographers.city, city) : undefined)
    .orderBy(desc(photographers.rating));
  return rows.map(toPhotographer);
}

export async function getPhotographer(id: number): Promise<Photographer | null> {
  const rows = await db
    .select()
    .from(photographers)
    .where(eq(photographers.id, id))
    .limit(1);
  return rows[0] ? toPhotographer(rows[0]) : null;
}
