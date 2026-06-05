import { describe, expect, it } from "vitest";
import { createBookingSchema } from "./bookings.schema.js";

describe("createBookingSchema", () => {
  it("accepts a valid booking payload", () => {
    const result = createBookingSchema.safeParse({
      photographerId: 1,
      clientName: "Acme Corp",
      scheduledAt: "2026-07-01T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a non-positive photographer id", () => {
    const result = createBookingSchema.safeParse({
      photographerId: 0,
      clientName: "Acme Corp",
      scheduledAt: "2026-07-01T10:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-ISO scheduledAt", () => {
    const result = createBookingSchema.safeParse({
      photographerId: 1,
      clientName: "Acme Corp",
      scheduledAt: "next tuesday",
    });
    expect(result.success).toBe(false);
  });
});
