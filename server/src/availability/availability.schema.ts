import { z } from "zod";
import type { SetAvailabilityInput } from "@snappr/shared";
import { addDays, isMonday } from "./availability.dates.js";

// HH:MM, 24-hour. Zero-padded so lexicographic compare == chronological compare.
const timeString = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Expected HH:MM (24h)");

// z.string().date() validates real calendar dates (rejects e.g. 2026-02-30).
const weekStartString = z
  .string()
  .date()
  .refine(isMonday, "weekStart must be a Monday");

const slotInput = z
  .object({
    date: z.string().date(),
    startTime: timeString,
    endTime: timeString,
  })
  .refine((s) => s.endTime > s.startTime, {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

type SlotInput = z.infer<typeof slotInput>;

// True if any two intervals on the same date overlap.
function hasOverlap(slots: SlotInput[]): boolean {
  const byDate = new Map<string, SlotInput[]>();
  for (const slot of slots) {
    const list = byDate.get(slot.date) ?? [];
    list.push(slot);
    byDate.set(slot.date, list);
  }
  for (const list of byDate.values()) {
    list.sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (let i = 1; i < list.length; i++) {
      if (list[i]!.startTime < list[i - 1]!.endTime) return true;
    }
  }
  return false;
}

export const setAvailabilitySchema = z
  .object({
    weekStart: weekStartString,
    slots: z.array(slotInput).max(50),
  })
  .refine(
    (input) => {
      const end = addDays(input.weekStart, 6);
      return input.slots.every((s) => s.date >= input.weekStart && s.date <= end);
    },
    { message: "every slot date must fall within the week", path: ["slots"] },
  )
  .refine((input) => !hasOverlap(input.slots), {
    message: "slots on the same date must not overlap",
    path: ["slots"],
  }) satisfies z.ZodType<SetAvailabilityInput>;

// Query for the read endpoint: which week to return.
export const availabilityQuerySchema = z.object({
  weekStart: weekStartString,
});
