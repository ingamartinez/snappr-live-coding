import { describe, expect, it } from "vitest";
import { setAvailabilitySchema } from "./availability.schema.js";

// 2026-06-08 is a Monday; 2026-06-14 is the Sunday that closes the week.
const weekStart = "2026-06-08";

describe("setAvailabilitySchema", () => {
  it("accepts a valid week with multiple intervals on one day", () => {
    const result = setAvailabilitySchema.safeParse({
      weekStart,
      slots: [
        { date: "2026-06-08", startTime: "09:00", endTime: "12:00" },
        { date: "2026-06-08", startTime: "14:00", endTime: "18:00" },
        { date: "2026-06-10", startTime: "09:00", endTime: "17:00" },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("accepts an empty week (clears availability)", () => {
    const result = setAvailabilitySchema.safeParse({ weekStart, slots: [] });
    expect(result.success).toBe(true);
  });

  it("rejects a weekStart that is not a Monday", () => {
    const result = setAvailabilitySchema.safeParse({
      weekStart: "2026-06-09", // Tuesday
      slots: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slot whose endTime is not after startTime", () => {
    const result = setAvailabilitySchema.safeParse({
      weekStart,
      slots: [{ date: "2026-06-08", startTime: "12:00", endTime: "09:00" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects overlapping intervals on the same date", () => {
    const result = setAvailabilitySchema.safeParse({
      weekStart,
      slots: [
        { date: "2026-06-08", startTime: "09:00", endTime: "12:00" },
        { date: "2026-06-08", startTime: "11:00", endTime: "13:00" },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a slot date outside the week", () => {
    const result = setAvailabilitySchema.safeParse({
      weekStart,
      slots: [{ date: "2026-06-15", startTime: "09:00", endTime: "17:00" }],
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed time", () => {
    const result = setAvailabilitySchema.safeParse({
      weekStart,
      slots: [{ date: "2026-06-08", startTime: "9am", endTime: "17:00" }],
    });
    expect(result.success).toBe(false);
  });
});
