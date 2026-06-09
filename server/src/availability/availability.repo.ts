import type { AvailabilitySlot, SetAvailabilityInput } from "@snappr/shared";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "../db/client.js";
import { availabilitySlots } from "../db/schema.js";
import { weekEnd } from "./availability.dates.js";

// `date` comes back as "YYYY-MM-DD"; `time` as "HH:MM:SS" -> trim to "HH:MM".
function toAvailabilitySlot(row: typeof availabilitySlots.$inferSelect): AvailabilitySlot {
  return {
    id: row.id,
    photographerId: row.photographerId,
    date: row.date,
    startTime: row.startTime.slice(0, 5),
    endTime: row.endTime.slice(0, 5),
  };
}

export async function getAvailabilityForWeek(
  photographerId: number,
  weekStart: string,
): Promise<AvailabilitySlot[]> {
  const rows = await db
    .select()
    .from(availabilitySlots)
    .where(
      and(
        eq(availabilitySlots.photographerId, photographerId),
        gte(availabilitySlots.date, weekStart),
        lte(availabilitySlots.date, weekEnd(weekStart)),
      ),
    )
    .orderBy(asc(availabilitySlots.date), asc(availabilitySlots.startTime));
  return rows.map(toAvailabilitySlot);
}

// Full-week replace: delete the photographer's slots in this week, insert the
// new set, return the saved week — all in one transaction so it is atomic.
export async function setAvailabilityForWeek(
  photographerId: number,
  input: SetAvailabilityInput,
): Promise<AvailabilitySlot[]> {
  const end = weekEnd(input.weekStart);
  const inWeek = and(
    eq(availabilitySlots.photographerId, photographerId),
    gte(availabilitySlots.date, input.weekStart),
    lte(availabilitySlots.date, end),
  );

  return db.transaction(async (tx) => {
    await tx.delete(availabilitySlots).where(inWeek);
    if (input.slots.length > 0) {
      await tx.insert(availabilitySlots).values(
        input.slots.map((slot) => ({
          photographerId,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
        })),
      );
    }
    const rows = await tx
      .select()
      .from(availabilitySlots)
      .where(inWeek)
      .orderBy(asc(availabilitySlots.date), asc(availabilitySlots.startTime));
    return rows.map(toAvailabilitySlot);
  });
}
