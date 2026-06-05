import type { Booking, CreateBookingInput } from "@snappr/shared";
import { pool } from "../db/pool.js";

interface BookingRow {
  id: number;
  photographer_id: number;
  client_name: string;
  scheduled_at: Date;
  status: Booking["status"];
  created_at: Date;
}

function toBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    photographerId: row.photographer_id,
    clientName: row.client_name,
    scheduledAt: row.scheduled_at.toISOString(),
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const { rows } = await pool.query<BookingRow>(
    `INSERT INTO bookings (photographer_id, client_name, scheduled_at)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [input.photographerId, input.clientName, input.scheduledAt],
  );
  return toBooking(rows[0]!);
}
