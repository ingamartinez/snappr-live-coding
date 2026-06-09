import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
} from "drizzle-orm/pg-core";

// Postgres enum — the DB enforces the allowed statuses, and the TS type is inferred.
export const bookingStatus = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
]);

export const photographers = pgTable(
  "photographers",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    city: text("city").notNull(),
    hourlyRate: integer("hourly_rate").notNull(),
    // numeric maps to string in JS to avoid float precision loss; we parse at the edge.
    rating: numeric("rating", { precision: 2, scale: 1 }).notNull().default("0"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_photographers_city").on(t.city),
    check("hourly_rate_nonneg", sql`${t.hourlyRate} >= 0`),
    check("rating_range", sql`${t.rating} >= 0 AND ${t.rating} <= 5`),
  ],
);

export const bookings = pgTable(
  "bookings",
  {
    id: serial("id").primaryKey(),
    photographerId: integer("photographer_id")
      .notNull()
      .references(() => photographers.id, { onDelete: "cascade" }),
    clientName: text("client_name").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: bookingStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("idx_bookings_photographer").on(t.photographerId)],
);

export const availabilitySlots = pgTable(
  "availability_slots",
  {
    id: serial("id").primaryKey(),
    photographerId: integer("photographer_id")
      .notNull()
      .references(() => photographers.id, { onDelete: "cascade" }),
    // `date` is wall-clock calendar date; `time` is wall-clock time of day. No
    // timezone — these represent the photographer's local business hours.
    date: date("date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_availability_photographer_date").on(t.photographerId, t.date),
    check("availability_time_order", sql`${t.endTime} > ${t.startTime}`),
  ],
);
