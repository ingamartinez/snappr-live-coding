import type { Booking, CreateBookingInput } from "@snappr/shared";
import { db } from "../db/client.js";
import { bookings } from "../db/schema.js";

function toBooking(row: typeof bookings.$inferSelect): Booking {
  return {
    id: row.id,
    photographerId: row.photographerId,
    clientName: row.clientName,
    scheduledAt: row.scheduledAt.toISOString(),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createBooking(input: CreateBookingInput): Promise<Booking> {
  const [row] = await db
    .insert(bookings)
    .values({
      photographerId: input.photographerId,
      clientName: input.clientName,
      scheduledAt: new Date(input.scheduledAt),
    })
    .returning();
  return toBooking(row!);
}
