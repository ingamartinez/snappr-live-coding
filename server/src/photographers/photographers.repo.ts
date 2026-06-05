import type { Photographer } from "@snappr/shared";
import { pool } from "../db/pool.js";

// Map a raw snake_case DB row to the camelCase shared contract.
interface PhotographerRow {
  id: number;
  name: string;
  city: string;
  hourly_rate: number;
  rating: string; // pg returns NUMERIC as string
  created_at: Date;
}

function toPhotographer(row: PhotographerRow): Photographer {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    hourlyRate: row.hourly_rate,
    rating: Number(row.rating),
    createdAt: row.created_at.toISOString(),
  };
}

export async function listPhotographers(city?: string): Promise<Photographer[]> {
  // Parameterized query — never interpolate user input into SQL.
  const { rows } = city
    ? await pool.query<PhotographerRow>(
        "SELECT * FROM photographers WHERE city = $1 ORDER BY rating DESC",
        [city],
      )
    : await pool.query<PhotographerRow>(
        "SELECT * FROM photographers ORDER BY rating DESC",
      );
  return rows.map(toPhotographer);
}

export async function getPhotographer(id: number): Promise<Photographer | null> {
  const { rows } = await pool.query<PhotographerRow>(
    "SELECT * FROM photographers WHERE id = $1",
    [id],
  );
  return rows[0] ? toPhotographer(rows[0]) : null;
}
